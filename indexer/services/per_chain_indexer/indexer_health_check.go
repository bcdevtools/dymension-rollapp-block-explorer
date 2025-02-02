package per_chain_indexer

//goland:noinspection SpellCheckingInspection
import (
	querysvc "github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/services/query"
	querytypes "github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/services/query/types"
	"github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/types"
	"slices"
	"strings"
	"time"
)

// refreshActiveJsonRpcUrl: check if active json rpc url is still valid, and use the most up-to-date, the fastest one
func (d *defaultIndexer) refreshActiveJsonRpcUrl() (updated bool, beGetChainInfoWhenUpdated *querytypes.ResponseBeGetChainInfo) {
	indexerCtx := types.UnwrapIndexerContext(d.ctx)
	logger := indexerCtx.GetLogger()

	activeJsonRpcUrl, lastUrlCheck := d.getActiveJsonRpcUrlAndLastCheckRL()
	if len(activeJsonRpcUrl) != 0 && time.Since(lastUrlCheck) <= d.indexingCfg.UrlCheckInterval {
		// no need to refresh
		return
	}

	// update the active json rpc url

	// fetch from provided URLs

	var responsesByJsonRpcUrl responseByJsonRpcUrlSlice
	for _, url := range d.getBeRpcUrlsRL() {
		d.querySvc.SetQueryEndpoint(url)
		resBeGetChainInfo, duration, err := querysvc.BeJsonRpcQueryWithRetry[*querytypes.ResponseBeGetChainInfo](
			d.querySvc,
			func(service querysvc.BeJsonRpcQueryService) (*querytypes.ResponseBeGetChainInfo, time.Duration, error) {
				return d.querySvc.BeGetChainInfo()
			},
			querytypes.DefaultRetryOption().
				MinCount(3).                // maximum number of retry
				MaxDuration(3*time.Second), /*RPC is not good if response time is too long*/
		)
		if err != nil {
			logger.Error("failed to get chain info", "url", url, "chain-id", d.chainId, "error", err.Error())
			continue
		}

		responsesByJsonRpcUrl = append(responsesByJsonRpcUrl, responseByJsonRpcUrl{
			url:      url,
			res:      resBeGetChainInfo,
			duration: duration,
		})
	}

	theBestResponse, found := responsesByJsonRpcUrl.GetTop()

	db := indexerCtx.GetDatabase()
	if !found {
		logger.Error("failed to get chain info from all json-rpc urls", "chain-id", d.chainId)
		d.forceResetActiveJsonRpcUrlDL(true)

		_, err := db.UpdateBeJsonRpcUrlsIfExists(d.chainId, []string{})
		if err != nil {
			logger.Error("failed to clear be_json_rpc_urls from chain_info record", "chain-id", d.chainId, "error", err.Error())
		}
	} else {
		d.updateActiveJsonRpcUrlAndLastCheckWL(theBestResponse.url, time.Now())

		// update URLs into the database
		var urls []string
		for _, res := range responsesByJsonRpcUrl {
			urls = append(urls, res.url)
		}

		_, err := db.UpdateBeJsonRpcUrlsIfExists(d.chainId, urls)
		if err != nil {
			logger.Error("failed to update be_json_rpc_urls into chain_info record", "chain-id", d.chainId, "error", err.Error())
		} else {
			updated = true
			beGetChainInfoWhenUpdated = theBestResponse.res
		}
	}

	return
}

// forceResetActiveJsonRpcUrlDL force requires to find active Json-RPC URL
func (d *defaultIndexer) forceResetActiveJsonRpcUrlDL(acquireLock bool) {
	if acquireLock {
		d.Lock()
		defer d.Unlock()
	}

	d.activeJsonRpcUrl = ""
	d.lastUrlCheck = time.Time{}
}

func (d *defaultIndexer) getActiveJsonRpcUrlAndLastCheckRL() (activeJsonRpcUrl string, lastUrlCheck time.Time) {
	d.RLock()
	defer d.RUnlock()

	return d.activeJsonRpcUrl, d.lastUrlCheck
}

func (d *defaultIndexer) updateActiveJsonRpcUrlAndLastCheckWL(activeJsonRpcUrl string, lastUrlCheck time.Time) {
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

const (
	maxSelfMaintainedBlocksFallBehind = 10
	maxSelfMaintainedEpochsFallBehind = 50
)

// GetTop performs sorting (using Sort) then returns the best response among the list, if any.
func (s responseByJsonRpcUrlSlice) GetTop() (theBest responseByJsonRpcUrl, found bool) {
	if len(s) == 0 {
		return
	}

	s.Sort()

	theBest = s[0]
	found = true

	// custom logic to select self-maintained RPC URL over the others
	const selfDomain = "1ocalhost.online"
	if len(s) > 1 && !strings.Contains(theBest.url, selfDomain) {
		// when top is not self-maintained, check if there is any self-maintained URL
		var selfMaintained responseByJsonRpcUrlSlice
		for _, res := range s[1:] {
			if strings.Contains(res.url, selfDomain) {
				selfMaintained = append(selfMaintained, res)
			}
		}
		if len(selfMaintained) > 0 {
			theBestSelfMaintained := selfMaintained[0]
			if theBestSelfMaintained.res != nil {
				notFarHeight := theBest.res.LatestBlock-theBestSelfMaintained.res.LatestBlock <= maxSelfMaintainedBlocksFallBehind
				notFarEpoch := theBest.res.LatestBlockTimeEpochUTC-theBestSelfMaintained.res.LatestBlockTimeEpochUTC <= maxSelfMaintainedEpochsFallBehind
				if notFarHeight && notFarEpoch {
					theBest = theBestSelfMaintained
				}
			}
		}
	}

	return
}
