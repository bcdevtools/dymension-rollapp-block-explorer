package cmd

import (
	"github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/types"
)

func loadConfig(homeDir string) (*types.Config, error) {
	cfg := &types.Config{}
	err := cfg.LoadConfig(homeDir)
	if err != nil {
		return nil, err
	}
	return cfg, nil
}

func loadChainList(homeDir string, conf *types.Config) (types.ChainList, error) {
	cl := make(types.ChainList)
	err := cl.LoadConfig(homeDir)
	if err != nil {
		return nil, err
	}

	if len(cl) > 0 {
		if len(conf.IndexingConfig.Whitelist) > 0 {
			whitelistChainList := make(types.ChainList)
			for _, chainID := range conf.IndexingConfig.Whitelist {
				if chain, ok := cl[chainID]; ok {
					whitelistChainList[chainID] = chain
				}
			}

			cl = whitelistChainList
		}

		for _, chain := range conf.IndexingConfig.IgnoreList {
			delete(cl, chain)
		}
	}

	return cl, nil
}
