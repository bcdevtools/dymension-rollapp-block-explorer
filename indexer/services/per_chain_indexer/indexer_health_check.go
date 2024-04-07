package per_chain_indexer

import (
	querytypes "github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/services/query/types"
	"github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/types"
	"slices"
	"time"
)

// refreshActiveJsonRpcUrl: check if active json rpc url is still valid, and use the most up-to-date, the fastest one
func (d *defaultIndexer) refreshActiveJsonRpcUrl() (updated bool, beGetChainInfoWhenUpdated *querytypes.ResponseBeGetChainInfo) {
	activeJsonRpcUrl, lastUrlCheck := d.getActiveJsonRpcUrlAndLastCheck()
	if len(activeJsonRpcUrl) != 0 && time.Since(lastUrlCheck) <= d.indexingCfg.UrlCheckInterval {
		// no need to update
		return
	}

	// update the active json rpc url

	indexerCtx := types.UnwrapIndexerContext(d.ctx)
	logger := indexerCtx.GetLogger()
	db := indexerCtx.GetDatabase()

	// fetch from provided URLs

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

		// update URLs into the database
		var urls []string
		for _, res := range responsesByJsonRpcUrl {
			urls = append(urls, res.url)
		}

		_, err := db.UpdateBeJsonRpcUrlsIfExists(d.chainConfig.ChainId, urls)
		if err != nil {
			logger.Error("failed to update be_json_rpc_urls into chain_info record", "chain-id", d.chainConfig.ChainId, "error", err.Error())
		} else {
			updated = true
			beGetChainInfoWhenUpdated = theBestResponse.res
		}
	}

	return
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