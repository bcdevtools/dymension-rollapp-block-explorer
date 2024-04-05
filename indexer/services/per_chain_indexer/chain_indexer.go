package per_chain_indexer

import (
	"context"
	"fmt"
	libapp "github.com/EscanBE/go-lib/app"
	dbtypes "github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/database/types"
	querysvc "github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/services/query"
	querytypes "github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/services/query/types"
	"github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/types"
	"github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/utils"
	"slices"
	"sync"
	"time"
)

type Indexer interface {
	// Start triggers start indexing on-chain data
	Start()

	// Reload update the external provided chain configuration.
	Reload(types.ChainConfig) error

	// Shutdown tells the indexer to start shutdown process.
	Shutdown()
}

var _ Indexer = &defaultIndexer{}

type defaultIndexer struct {
	sync.RWMutex

	ctx         context.Context
	indexingCfg types.Indexing

	chainName        string
	chainConfig      types.ChainConfig
	querySvc         querysvc.BeJsonRpcQueryService
	activeJsonRpcUrl string

	started      bool // flag to indicate indexer first started indexing or not
	shutdown     bool // flag to indicate indexer should not continue to do it's work
	lastUrlCheck time.Time
}

func NewIndexer(
	ctx context.Context,
	chainName string, chainConfig types.ChainConfig,
) Indexer {
	indexingConfig := types.UnwrapIndexerContext(ctx).GetConfig().IndexingConfig
	return &defaultIndexer{
		ctx:         ctx,
		indexingCfg: indexingConfig,
		chainName:   chainName,
		chainConfig: chainConfig,
		querySvc:    querysvc.NewBeJsonRpcQueryService(chainConfig.ChainId),
	}
}

func (d *defaultIndexer) Start() {
	indexerCtx := types.UnwrapIndexerContext(d.ctx)
	logger := indexerCtx.GetLogger()
	db := indexerCtx.GetDatabase()

	defer libapp.TryRecoverAndExecuteExitFunctionIfRecovered(logger)

	logger.Debug("Starting indexer", "chain", d.chainName)

	d.ensureNotStartedWithRLock()

	for {
		err := utils.ObserveLongOperation("create partitioned tables for chain-id", func() error {
			return db.PreparePartitionedTablesForChainId(d.chainConfig.ChainId)
		}, 15*time.Second, logger)
		if err != nil {
			logger.Error("failed to create partitioned tables for chain-id, retrying...", "chain-id", d.chainConfig.ChainId, "error", err.Error())
			time.Sleep(15 * time.Second)
			continue
		}
		logger.Info("successfully prepared partitioned tables for chain-id", "chain-id", d.chainConfig.ChainId)
		break
	}

	var isChainInfoRecordExists bool // is a flag indicate the is record chain info exists in the database so no need to call insert

	for !d.isShuttingDownWithRLock() {
		time.Sleep(d.indexingCfg.IndexBlockInterval)

		var beGetChainInfo *querytypes.ResponseBeGetChainInfo
		var err error

		// check if active json rpc url is still valid, and use the most up-to-date, the fastest one
		activeJsonRpcUrl, lastUrlCheck := d.getActiveJsonRpcUrlAndLastCheck()
		if len(activeJsonRpcUrl) == 0 || time.Since(lastUrlCheck) > d.indexingCfg.UrlCheckInterval {
			// update the active json rpc url

			var responsesByJsonRpcUrl responseByJsonRpcUrlSlice

			for _, url := range d.chainConfig.BeJsonRpcUrls {
				d.querySvc.SetQueryEndpoint(url)
				resBeGetChainInfo, duration, err := d.querySvc.BeGetChainInfo()
				if err != nil {
					logger.Error("failed to get chain info", "url", url, "chain-id", d.chainConfig.ChainId, "error", err.Error())
					continue
				}
				responsesByJsonRpcUrl = append(responsesByJsonRpcUrl, responseByJsonRpcUrl{
					url:      url,
					res:      resBeGetChainInfo,
					duration: duration,
				})
			}

			theBestResponse, found := responsesByJsonRpcUrl.GetTop()
			if !found {
				logger.Error("failed to get chain info from all json-rpc urls", "chain-id", d.chainConfig.ChainId)
				d.forceResetActiveJsonRpcUrl(true)

				_, err := db.UpdateBeJsonRpcUrlsIfExists(d.chainConfig.ChainId, []string{})
				if err != nil {
					logger.Error("failed to clear be_json_rpc_urls from chain_info record", "chain-id", d.chainConfig.ChainId, "error", err.Error())
				}
			} else {
				d.updateActiveJsonRpcUrlAndLastCheckWithLock(theBestResponse.url, time.Now())
				beGetChainInfo = theBestResponse.res

				// update URLs into the database
				var urls []string
				for _, res := range responsesByJsonRpcUrl {
					urls = append(urls, res.url)
				}

				_, err := db.UpdateBeJsonRpcUrlsIfExists(d.chainConfig.ChainId, urls)
				if err != nil {
					logger.Error("failed to update be_json_rpc_urls into chain_info record", "chain-id", d.chainConfig.ChainId, "error", err.Error())
				}
			}
		}

		activeJsonRpcUrl, _ = d.getActiveJsonRpcUrlAndLastCheck()
		// if no active json rpc url at this point, skip indexing
		if len(activeJsonRpcUrl) == 0 {
			logger.Error("no active json-rpc url, skip indexing", "chain-id", d.chainConfig.ChainId)
			d.forceResetActiveJsonRpcUrl(true)
			time.Sleep(15 * time.Second)
			continue
		}

		// use the active url
		d.querySvc.SetQueryEndpoint(activeJsonRpcUrl)

		if beGetChainInfo == nil {
			beGetChainInfo, _, err = d.querySvc.BeGetChainInfo()
			if err != nil {
				logger.Error("failed to get chain info, waiting for next round", "chain-id", d.chainConfig.ChainId, "error", err.Error())
				continue
			}
		}

		// validate chain info
		// Even tho the validation was performed earlier, it's better to double-check and provide more context
		if beGetChainInfo.ChainId != d.chainConfig.ChainId {
			logger.Error("chain-id mismatch", "expected", d.chainConfig.ChainId, "got", beGetChainInfo.ChainId)
			d.forceResetActiveJsonRpcUrl(true)
			continue
		}

		// insert chain info record
		if !isChainInfoRecordExists {
			_, err := db.InsertRecordChainInfoIfNotExists(dbtypes.RecordChainInfo{
				ChainId:       beGetChainInfo.ChainId,
				Name:          d.chainName,
				ChainType:     beGetChainInfo.ChainType,
				Bech32:        beGetChainInfo.Bech32,
				Denoms:        beGetChainInfo.Denom,
				BeJsonRpcUrls: []string{activeJsonRpcUrl},
			})
			if err != nil {
				logger.Error("failed to insert chain info record", "chain-id", d.chainConfig.ChainId, "error", err.Error())
				continue
			}
			isChainInfoRecordExists = true
		}

		// perform indexing
	}

	logger.Info("shutting down indexer", "name", d.chainName)
}

func (d *defaultIndexer) Reload(chainConfig types.ChainConfig) error {
	d.Lock()
	defer d.Unlock()

	if chainConfig.ChainId != d.chainConfig.ChainId {
		return fmt.Errorf("mis-match chain-id, expected %s, got new %s", d.chainConfig.ChainId, chainConfig.ChainId)
	}

	if !utils.AreSortedStringArraysEquals(d.chainConfig.BeJsonRpcUrls, chainConfig.BeJsonRpcUrls) {
		// urls changed, force health-check URLs
		d.forceResetActiveJsonRpcUrl(false)
	}

	d.chainConfig = chainConfig
	return nil
}

func (d *defaultIndexer) Shutdown() {
	d.Lock()
	defer d.Unlock()

	d.shutdown = true
}

// ensureNotStartedWithRLock panics if the indexer has already started.
func (d *defaultIndexer) ensureNotStartedWithRLock() {
	d.RLock()
	defer d.RUnlock()

	if d.started {
		panic(fmt.Sprintf("indexer for %s has already started", d.chainName))
	}
}

// isShuttingDownWithRLock returns true of the indexer is flagged as in shutting down state.
func (d *defaultIndexer) isShuttingDownWithRLock() bool {
	d.RLock()
	defer d.RUnlock()

	return d.shutdown
}

// forceResetActiveJsonRpcUrl force requires to find active Json-RPC URL
func (d *defaultIndexer) forceResetActiveJsonRpcUrl(acquireLock bool) {
	if acquireLock {
		d.Lock()
		defer d.Unlock()
	}

	d.activeJsonRpcUrl = ""
	d.lastUrlCheck = time.Time{}
}

func (d *defaultIndexer) getActiveJsonRpcUrlAndLastCheck() (activeJsonRpcUrl string, lastUrlCheck time.Time) {
	d.RLock()
	defer d.RUnlock()

	return d.activeJsonRpcUrl, d.lastUrlCheck
}

func (d *defaultIndexer) updateActiveJsonRpcUrlAndLastCheckWithLock(activeJsonRpcUrl string, lastUrlCheck time.Time) {
	d.Lock()
	defer d.Unlock()

	d.activeJsonRpcUrl = activeJsonRpcUrl
	d.lastUrlCheck = lastUrlCheck
}

type responseByJsonRpcUrl struct {
	url      string
	res      *querytypes.ResponseBeGetChainInfo
	duration time.Duration
}

// responseByJsonRpcUrlSlice is used for sorting
type responseByJsonRpcUrlSlice []responseByJsonRpcUrl

// Sort sorts the response, priority the latest height, then response time. The best stay at the first index.
func (s responseByJsonRpcUrlSlice) Sort() {
	slices.SortFunc(s, func(l, r responseByJsonRpcUrl) int {
		// first priority: block height
		if l.res.LatestBlock < r.res.LatestBlock {
			return 1
		}
		if l.res.LatestBlock > r.res.LatestBlock {
			return -1
		}
		// second priority: response time
		if l.duration < r.duration {
			return -1
		}
		if l.duration > r.duration {
			return 1
		}
		return 0
	})
}

// GetTop performs sorting (using Sort) then returns the best response among the list, if any.
func (s responseByJsonRpcUrlSlice) GetTop() (theBest responseByJsonRpcUrl, found bool) {
	if len(s) == 0 {
		return
	}

	s.Sort()

	theBest = s[0]
	found = true
	return
}
