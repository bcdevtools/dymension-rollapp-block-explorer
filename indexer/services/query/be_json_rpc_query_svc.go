package query

import (
	"bytes"
	"fmt"
	querytypes "github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/services/query/types"
	"github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/types"
	"github.com/pkg/errors"
	"io"
	"net/http"
	"sync"
	"time"
)

type BeJsonRpcQueryService interface {
	SetQueryEndpoint(url string)

	// BeGetChainInfo is `be_getChainInfo`
	BeGetChainInfo() (res *querytypes.ResponseBeGetChainInfo, duration time.Duration, err error)
}

var _ BeJsonRpcQueryService = &defaultBeJsonRpcQueryService{}

type defaultBeJsonRpcQueryService struct {
	mutex sync.RWMutex

	chainId string

	// queryEndpoint is the active query endpoint
	queryEndpoint string
}

// NewBeJsonRpcQueryService initialize and returns a BeJsonRpcQueryService instance
func NewBeJsonRpcQueryService(chainId string) BeJsonRpcQueryService {
	return &defaultBeJsonRpcQueryService{
		mutex:         sync.RWMutex{},
		chainId:       chainId,
		queryEndpoint: "",
	}
}

func (d *defaultBeJsonRpcQueryService) SetQueryEndpoint(url string) {
	d.mutex.Lock()
	defer d.mutex.Unlock()
	d.queryEndpoint = url
}

func (d defaultBeJsonRpcQueryService) BeGetChainInfo() (res *querytypes.ResponseBeGetChainInfo, duration time.Duration, err error) {
	startTime := time.Now().UTC()

	var bz []byte
	bz, err = d.doQuery(
		types.NewJsonRpcQueryBuilder("be_getChainInfo"),
		1_000,
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

	responseBeGetChainInfo := resAny.(querytypes.ResponseBeGetChainInfo)
	if err = responseBeGetChainInfo.ValidateBasic(); err != nil {
		err = errors.Wrap(err, "response validation failed")
		return
	}

	if responseBeGetChainInfo.ChainId != d.chainId {
		err = errors.Wrapf(querytypes.ErrBlackListDueToMisMatchChainId, "want %s, got %s", d.chainId, responseBeGetChainInfo.ChainId)
		return
	}

	res = &responseBeGetChainInfo
	return
}

func (d defaultBeJsonRpcQueryService) getQueryEndpointWithRLock() string {
	d.mutex.RLock()
	defer d.mutex.RUnlock()
	return d.queryEndpoint
}

func (d defaultBeJsonRpcQueryService) doQuery(qb types.JsonRpcQueryBuilder, timeoutMs uint32) ([]byte, error) {
	if timeoutMs == 0 {
		timeoutMs = 5_000
	}

	httpClient := http.Client{
		Timeout: time.Duration(timeoutMs) * time.Millisecond,
	}

	resp, err := httpClient.Post(d.getQueryEndpointWithRLock(), "application/json", bytes.NewBuffer([]byte(qb.String())))
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
