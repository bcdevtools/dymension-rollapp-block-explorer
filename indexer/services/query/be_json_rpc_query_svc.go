package query

//goland:noinspection SpellCheckingInspection
import (
	"bytes"
	"fmt"
	querytypes "github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/services/query/types"
	"github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/types"
	"github.com/pkg/errors"
	"io"
	"net/http"
	"strconv"
	"sync"
	"time"
)

type BeJsonRpcQueryService interface {
	SetQueryEndpoint(url string)

	GetQueryEndpoint() string

	// BeGetChainInfo is `be_getChainInfo`
	BeGetChainInfo() (res *querytypes.ResponseBeGetChainInfo, duration time.Duration, err error)

	// BeGetLatestBlockNumber is `be_getLatestBlockNumber`
	BeGetLatestBlockNumber() (res *querytypes.ResponseBeGetLatestBlockNumber, duration time.Duration, err error)

	// BeTransactionsInBlockRange is `be_getTransactionsInBlockRange`
	BeTransactionsInBlockRange(from, to int64) (res *querytypes.TransformedResponseBeTransactionsInBlockRange, duration time.Duration, err error)
}

var _ BeJsonRpcQueryService = &defaultBeJsonRpcQueryService{}

type defaultBeJsonRpcQueryService struct {
	sync.RWMutex

	chainId string

	// queryEndpoint is the active query endpoint
	queryEndpoint string
}

// NewBeJsonRpcQueryService initialize and returns a BeJsonRpcQueryService instance
func NewBeJsonRpcQueryService(chainId string) BeJsonRpcQueryService {
	return &defaultBeJsonRpcQueryService{
		RWMutex:       sync.RWMutex{},
		chainId:       chainId,
		queryEndpoint: "",
	}
}

func (d *defaultBeJsonRpcQueryService) SetQueryEndpoint(url string) {
	d.setQueryEndpointWL(url)
}

func (d *defaultBeJsonRpcQueryService) setQueryEndpointWL(url string) {
	d.Lock()
	defer d.Unlock()
	d.queryEndpoint = url
}

func (d *defaultBeJsonRpcQueryService) GetQueryEndpoint() string {
	return d.getQueryEndpointRL()
}

func (d *defaultBeJsonRpcQueryService) getQueryEndpointRL() string {
	d.RLock()
	defer d.RUnlock()
	return d.queryEndpoint
}

func (d *defaultBeJsonRpcQueryService) BeGetChainInfo() (res *querytypes.ResponseBeGetChainInfo, duration time.Duration, err error) {
	startTime := time.Now().UTC()

	var bz []byte
	bz, err = d.doQuery(
		types.NewJsonRpcQueryBuilder("be_getChainInfo"),
		1*time.Second,
	)
	if err != nil {
		return
	}
	duration = time.Since(startTime)

	var resAny any
	resAny, err = types.ParseJsonRpcResponse[querytypes.ResponseBeGetChainInfo](bz)
	if err != nil {
		return
	}

	responseBeGetChainInfo := resAny.(*querytypes.ResponseBeGetChainInfo)
	if err = responseBeGetChainInfo.ValidateBasic(); err != nil {
		err = errors.Wrap(err, "response validation failed")
		return
	}

	if responseBeGetChainInfo.ChainId != d.chainId {
		err = errors.Wrapf(querytypes.ErrBlackListDueToMisMatchChainId, "want %s, got %s", d.chainId, responseBeGetChainInfo.ChainId)
		return
	}

	res = responseBeGetChainInfo
	return
}

func (d *defaultBeJsonRpcQueryService) BeGetLatestBlockNumber() (res *querytypes.ResponseBeGetLatestBlockNumber, duration time.Duration, err error) {
	startTime := time.Now().UTC()

	var bz []byte
	bz, err = d.doQuery(
		types.NewJsonRpcQueryBuilder("be_getLatestBlockNumber"),
		2*time.Second,
	)
	if err != nil {
		return
	}
	duration = time.Since(startTime)

	var resAny any
	resAny, err = types.ParseJsonRpcResponse[querytypes.ResponseBeGetLatestBlockNumber](bz)
	if err != nil {
		return
	}

	responseBeGetChainInfo := resAny.(*querytypes.ResponseBeGetLatestBlockNumber)
	if err = responseBeGetChainInfo.ValidateBasic(); err != nil {
		err = errors.Wrap(err, "response validation failed")
		return
	}

	res = responseBeGetChainInfo
	return
}

func (d *defaultBeJsonRpcQueryService) BeTransactionsInBlockRange(from, to int64) (res *querytypes.TransformedResponseBeTransactionsInBlockRange, duration time.Duration, err error) {
	startTime := time.Now().UTC()

	var bz []byte
	bz, err = d.doQuery(
		types.NewJsonRpcQueryBuilder(
			"be_getTransactionsInBlockRange",
			types.NewJsonRpcInt64QueryParam(from),
			types.NewJsonRpcInt64QueryParam(to),
		),
		10*time.Second,
	)
	if err != nil {
		return
	}
	duration = time.Since(startTime)

	var resAny any
	resAny, err = types.ParseJsonRpcResponse[querytypes.ResponseBeTransactionsInBlockRange](bz)
	if err != nil {
		return
	}

	responseBeTransactionsInBlockRange := resAny.(*querytypes.ResponseBeTransactionsInBlockRange)
	if err = responseBeTransactionsInBlockRange.ValidateBasic(); err != nil {
		err = errors.Wrap(err, "response validation failed")
		return
	}

	if responseBeTransactionsInBlockRange.ChainId != d.chainId {
		err = errors.Wrapf(querytypes.ErrBlackListDueToMisMatchChainId, "want %s, got %s", d.chainId, responseBeTransactionsInBlockRange.ChainId)
		return
	}

	for _, missingBlock := range responseBeTransactionsInBlockRange.MissingBlocks {
		if missingBlock < from || missingBlock > to {
			err = errors.Wrapf(querytypes.ErrBlackList, "missing block %d out of range [%d, %d]", missingBlock, from, to)
			return
		}
	}

	for _, errorBlock := range responseBeTransactionsInBlockRange.ErrorBlocks {
		if errorBlock < from || errorBlock > to {
			err = errors.Wrapf(querytypes.ErrBlackList, "error block %d out of range [%d, %d]", errorBlock, from, to)
			return
		}
	}

	res = &querytypes.TransformedResponseBeTransactionsInBlockRange{
		MissingBlocks: responseBeTransactionsInBlockRange.MissingBlocks,
		ErrorBlocks:   responseBeTransactionsInBlockRange.ErrorBlocks,
	}
	defer func() {
		if err != nil {
			res = nil
		}
	}()

	for heightStr, block := range responseBeTransactionsInBlockRange.Blocks {
		var height int64
		height, err = strconv.ParseInt(heightStr, 10, 64)
		if err != nil {
			err = errors.Wrapf(querytypes.ErrBlackList, "malformed block height %s", heightStr)
			return
		}

		if height < from || height > to {
			err = errors.Wrapf(querytypes.ErrBlackList, "block height %d out of range [%d, %d]", height, from, to)
			return
		}

		block.Height = height
		res.Blocks = append(res.Blocks, block)
	}

	return
}

func (d *defaultBeJsonRpcQueryService) doQuery(qb types.JsonRpcQueryBuilder, optionalTimeout time.Duration) ([]byte, error) {
	var timeout = optionalTimeout
	if optionalTimeout == 0 {
		timeout = 5 * time.Second
	}
	if timeout < time.Second {
		timeout = time.Second
	}

	httpClient := http.Client{
		Timeout: timeout,
	}

	resp, err := httpClient.Post(d.getQueryEndpointRL(), "application/json", bytes.NewBuffer([]byte(qb.String())))
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("non-OK status code: %d", resp.StatusCode)
	}

	defer func() {
		_ = resp.Body.Close()
	}()

	bz, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, errors.Wrap(err, "failed to read response body")
	}

	return bz, nil
}
