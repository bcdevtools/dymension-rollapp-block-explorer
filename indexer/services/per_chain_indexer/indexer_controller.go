package per_chain_indexer

import (
	"fmt"
	"github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/types"
	"github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/utils"
)

func (d *defaultIndexer) Reload(chainConfig types.ChainConfig) error {
	return d.reloadWL(chainConfig)
}

func (d *defaultIndexer) reloadWL(chainConfig types.ChainConfig) error {
	d.Lock()
	defer d.Unlock()

	if chainConfig.ChainId != d.chainId {
		return fmt.Errorf("mis-match chain-id, expected %s, got new %s", d.chainId, chainConfig.ChainId)
	}

	if !utils.AreSortedStringArraysEquals(d.chainConfig.BeJsonRpcUrls, chainConfig.BeJsonRpcUrls) {
		// urls changed, force health-check URLs
		d.forceResetActiveJsonRpcUrlDL(false)
	}

	d.chainConfig = chainConfig
	return nil
}

func (d *defaultIndexer) Shutdown() {
	d.shutdownWL()
}

func (d *defaultIndexer) shutdownWL() {
	d.Lock()
	defer d.Unlock()

	d.shutdown = true
}

// ensureNotStartedRL panics if the indexer has already started.
func (d *defaultIndexer) ensureNotStartedRL() {
	d.RLock()
	defer d.RUnlock()

	if d.started {
		panic(fmt.Sprintf("indexer for %s has already started", d.chainName))
	}
}
