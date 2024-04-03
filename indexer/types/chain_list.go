package types

import (
	"fmt"
	"github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/constants"
	"github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/utils"
	"github.com/pkg/errors"
	"github.com/spf13/viper"
	"os"
	"path"
)

// ChainList is the structure representation of configuration from `chains.yaml` file
type ChainList map[string]ChainConfig

// ChainConfig represent per-chain configuration
type ChainConfig struct {
	ChainId       string   `mapstructure:"chain_id"`
	BeJsonRpcUrls []string `mapstructure:"be_json_rpc_urls"`
}

// LoadConfig load the configuration from `chains.yaml` file within the specified application's home directory
func (cl ChainList) LoadConfig(homeDir string) error {
	cfgFile := path.Join(homeDir, constants.DEFAULT_CHAIN_LIST_FILE_NAME)

	var fileStats os.FileInfo
	fileStats, err := os.Stat(cfgFile)
	if err != nil {
		if os.IsNotExist(err) {
			return fmt.Errorf("chain list file %s could not be found", cfgFile)
		}

		return err
	}

	if fileStats.Mode().Perm() != constants.FILE_PERMISSION && fileStats.Mode().Perm() != 0o700 {
		panic(fmt.Errorf("incorrect permission of %s, must be %s or 700", constants.DEFAULT_CHAIN_LIST_FILE_NAME, constants.FILE_PERMISSION_STR))
	}

	viper.SetConfigType(constants.CONFIG_TYPE)
	viper.SetConfigFile(cfgFile)

	// If a chain list config file is found, read it in.
	if err = viper.ReadInConfig(); err != nil {
		return errors.Wrap(err, "unable to read chain list file")
	}

	err = viper.Unmarshal(&cl)
	if err != nil {
		return errors.Wrap(err, "unable to deserialize chain list file")
	}

	return nil
}

// Validate performs validation on the configuration specified in the `chains.yaml` within application's home directory
func (cl ChainList) Validate() error {
	uniqueChainIdTracker := make(map[string]bool)

	var err error
	for chainName, chainConfig := range cl {
		validationErr := chainConfig.Validate()
		if validationErr != nil {
			err = utils.MergeError(err, fmt.Errorf("chain '%s' has invalid configuration: %s", chainName, validationErr.Error()))
		}

		normalizedChainId := chainConfig.ChainId
		if _, found := uniqueChainIdTracker[normalizedChainId]; found {
			err = utils.MergeError(err, fmt.Errorf("duplicated chain-id %s", normalizedChainId))
		} else {
			uniqueChainIdTracker[normalizedChainId] = true
		}
	}
	return err
}

func (cl ChainList) PrintOptions() {
	headerPrintf("- Manage %d chains\n", len(cl))
	for chainName, config := range cl {
		headerPrintf("  + %s (%s): %d urls\n", chainName, config.ChainId, len(config.BeJsonRpcUrls))
	}
}

// Validate performs validation per chain configuration
func (cc ChainConfig) Validate() error {
	if len(cc.ChainId) < 1 {
		return fmt.Errorf("chain_id is missing")
	}
	if len(cc.BeJsonRpcUrls) < 1 {
		return fmt.Errorf("require at least one URL for Block Explorer Json-RPC")
	}
	var err error
	for _, ep := range cc.BeJsonRpcUrls {
		if len(ep) < 1 {
			err = utils.MergeError(err, fmt.Errorf("empty record for URL of Block Explorer Json-RPC"))
			continue
		}
		if !utils.IsUrl(ep) {
			err = utils.MergeError(err, fmt.Errorf("invalid URL for Block Explorer Json-RPC: %s", ep))
			continue
		}
	}
	return err
}
