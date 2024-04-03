package per_chain_indexer

import (
	"context"
	"fmt"
	libapp "github.com/EscanBE/go-lib/app"
	"github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/types"
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

	chainName   string
	chainConfig types.ChainConfig

	started  bool // flag to indicate indexer first started indexing or not
	shutdown bool // flag to indicate indexer should not continue to do it's work
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
	}
}

func (d *defaultIndexer) Start() {
	logger := types.UnwrapIndexerContext(d.ctx).GetLogger()

	defer libapp.TryRecoverAndExecuteExitFunctionIfRecovered(logger)

	logger.Debug("Starting indexer", "chain", d.chainName)

	d.ensureNotStartedWithRLock()

	for !d.isShuttingDownWithRLock() {
		time.Sleep(d.indexingCfg.IndexBlockInterval)
	}

	logger.Info("shutting down indexer", "name", d.chainName)
}

func (d *defaultIndexer) Reload(chainConfig types.ChainConfig) error {
	d.Lock()
	defer d.Unlock()

	if chainConfig.ChainId != d.chainConfig.ChainId {
		return fmt.Errorf("mis-match chain-id, expected %s, got new %s", d.chainConfig.ChainId, chainConfig.ChainId)
	}

	d.chainConfig = chainConfig
	return nil
}

func (d *defaultIndexer) Shutdown() {
	d.Lock()
	defer d.Unlock()

	d.shutdown = true
}

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
