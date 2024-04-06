package per_chain_indexer

import (
	"context"
	"github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/types"
	"sync"
)

type IndexerManager interface {
	// Reload take chain list and launches indexers corresponding
	Reload(cl types.ChainList)
}

var _ IndexerManager = &defaultIndexerManager{}

// defaultIndexerManager is the default IndexerManager
type defaultIndexerManager struct {
	sync.RWMutex

	ctx context.Context

	indexerByChainName map[string]Indexer
}

func NewIndexerManager(ctx context.Context) IndexerManager {
	return &defaultIndexerManager{
		RWMutex:            sync.RWMutex{},
		ctx:                ctx,
		indexerByChainName: make(map[string]Indexer),
	}
}

func (d *defaultIndexerManager) Reload(cl types.ChainList) {
	d.Lock()
	defer d.Unlock()

	logger := types.UnwrapIndexerContext(d.ctx).GetLogger()
	logger.Info("going to reload chain list", "old-size", len(d.indexerByChainName), "new-size", len(cl))

	// Step 1: shutdown un-used indexer
	var shutdownIndexers []string
	for name, existingIndexer := range d.indexerByChainName {
		if _, found := cl[name]; found {
			// keep
			continue
		}
		shutdownIndexers = append(shutdownIndexers, name)
		existingIndexer.Shutdown() // signal to start shutdown process
		logger.Info("shutting down indexer", "name", name)
	}
	for _, nameOfShutdownIndexer := range shutdownIndexers {
		delete(d.indexerByChainName, nameOfShutdownIndexer)
	}

	// Step 2: launching indexer for new records
	var createIndexerForChains []string
	for name := range cl {
		if _, found := d.indexerByChainName[name]; found {
			// skip
			continue
		}
		createIndexerForChains = append(createIndexerForChains, name)
	}
	for _, chainNameWithoutIndexer := range createIndexerForChains {
		indexer := NewIndexer(d.ctx, chainNameWithoutIndexer, cl[chainNameWithoutIndexer])
		d.indexerByChainName[chainNameWithoutIndexer] = indexer
		logger.Info("launching new indexer", "name", chainNameWithoutIndexer)
		go indexer.Start()
	}

	// Step 3: update configuration for existing indexers
	for chainName, chainConfig := range cl {
		indexerByName, found := d.indexerByChainName[chainName]
		if !found {
			// ignore
			continue
		}
		if err := indexerByName.Reload(chainConfig); err != nil {
			logger.Error("failed to reload chain config", "chain-name", chainName, "chain-id", chainConfig.ChainId, "error", err.Error())
			// skip update
		}
	}
}