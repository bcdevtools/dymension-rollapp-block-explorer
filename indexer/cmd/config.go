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

func loadChainList(homeDir string) (*types.ChainList, error) {
	cfg := &types.ChainList{}
	err := cfg.LoadConfig(homeDir)
	if err != nil {
		return nil, err
	}
	return cfg, nil
}
