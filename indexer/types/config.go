package types

import (
	"fmt"
	libdbtypes "github.com/EscanBE/go-lib/database/types"
	logtypes "github.com/EscanBE/go-lib/logging/types"
	"github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/constants"
	"github.com/pkg/errors"
	"github.com/spf13/viper"
	"os"
	"path"
	"time"
)

// Config is the structure representation of configuration from `config.yaml` file
type Config struct {
	IndexingConfig Indexing               `mapstructure:"indexing"`
	Logging        logtypes.LoggingConfig `mapstructure:"logging"`
	SecretConfig   Secret                 `mapstructure:"secrets"`
	Endpoints      Endpoints              `mapstructure:"endpoints"`
	TelegramConfig Telegram               `mapstructure:"telegram"`
}

// Indexing is the structure representation of configuration from `config.yaml` file, at `indexing` section.
// Configuration for indexing on-chain data can be putted here
type Indexing struct {
	HotReloadInterval             time.Duration `mapstructure:"hot-reload"`
	UrlCheckInterval              time.Duration `mapstructure:"url-check"`
	IndexBlockInterval            time.Duration `mapstructure:"index-block"`
	DisableRetryIndexFailedBlocks bool          `mapstructure:"disable-retry-failed-blocks"`
}

// Secret is the structure representation of configuration from `config.yaml` file, at `secret` section.
// Secret keys, tokens,... can be putted here
type Secret struct {
	TelegramToken string `mapstructure:"telegram-token"`
}

// Endpoints holds nested configurations relates to remote endpoints
type Endpoints struct {
	Database libdbtypes.PostgresDatabaseConfig `mapstructure:"db"`
}

// Telegram is the structure representation of configuration from `config.yaml` file, at `telegram` section.
// It holds configuration of Telegram bot
type Telegram struct {
	LogChannelID int64 `mapstructure:"log-channel-id"`
	ErrChannelID int64 `mapstructure:"error-channel-id"`
}

// LoadConfig load the configuration from `config.yaml` file within the specified application's home directory
func (c *Config) LoadConfig(homeDir string) error {
	cfgFile := path.Join(homeDir, constants.DEFAULT_CONFIG_FILE_NAME)

	var fileStats os.FileInfo
	fileStats, err := os.Stat(cfgFile)
	if err != nil {
		if os.IsNotExist(err) {
			return fmt.Errorf("config file %s could not be found", cfgFile)
		}

		return err
	}

	if fileStats.Mode().Perm() != constants.FILE_PERMISSION && fileStats.Mode().Perm() != 0o700 {
		panic(fmt.Errorf("incorrect permission of %s, must be %s or 700", constants.DEFAULT_CONFIG_FILE_NAME, constants.FILE_PERMISSION_STR))
	}

	viper.SetConfigType(constants.CONFIG_TYPE)
	viper.SetConfigFile(cfgFile)

	// If a config file is found, read it in.
	if err = viper.ReadInConfig(); err != nil {
		return errors.Wrap(err, "unable to read conf file")
	}

	err = viper.Unmarshal(c)
	if err != nil {
		return errors.Wrap(err, "unable to deserialize conf file")
	}

	return nil
}

// PrintOptions prints the configuration in the `config.yaml` in a nice way, human-readable
func (c Config) PrintOptions() {
	headerPrintln("- Indexing configuration:")
	headerPrintf("  + Hot-reload chain-list every: %s\n", c.IndexingConfig.HotReloadInterval)
	headerPrintf("  + Json-RPC URL health-check every: %s\n", c.IndexingConfig.UrlCheckInterval)
	headerPrintf("  + Index new block every: %s\n", c.IndexingConfig.IndexBlockInterval)
	headerPrintf("  + Disable retry failed blocks: %t\n", c.IndexingConfig.DisableRetryIndexFailedBlocks)
	headerPrintln("- Tokens configuration:")
	if len(c.SecretConfig.TelegramToken) > 0 {
		headerPrintln("  + Telegram bot token has set")

		if len(c.SecretConfig.TelegramToken) > 0 {
			if c.TelegramConfig.LogChannelID != 0 {
				headerPrintf("  + Telegram log channel ID: %s\n", c.TelegramConfig.LogChannelID)
			} else {
				headerPrintln("  + Missing configuration for log channel ID")
			}
			if c.TelegramConfig.ErrChannelID != 0 {
				headerPrintf("  + Telegram error channel ID: %s\n", c.TelegramConfig.ErrChannelID)
			} else {
				headerPrintln("  + Missing configuration for error channel ID")
			}
		}
	} else {
		headerPrintln("  + Telegram function was disabled because token has not been set")
	}

	headerPrintln("- Logging:")
	if len(c.Logging.Level) < 1 {
		headerPrintf("  + Level: %s\n", logtypes.LOG_LEVEL_DEFAULT)
	} else {
		headerPrintf("  + Level: %s\n", c.Logging.Level)
	}

	if len(c.Logging.Format) < 1 {
		headerPrintf("  + Format: %s\n", logtypes.LOG_FORMAT_DEFAULT)
	} else {
		headerPrintf("  + Format: %s\n", c.Logging.Format)
	}

	headerPrintln("- Database:")
	headerPrintf("  + Host: %s\n", c.Endpoints.Database.Host)
	headerPrintf("  + Port: %d\n", c.Endpoints.Database.Port)
	headerPrintf("  + Username: %s\n", c.Endpoints.Database.Username)
	headerPrintf("  + DB name: %s\n", c.Endpoints.Database.Name)
	headerPrintf("  + Schema name: %s\n", c.Endpoints.Database.Schema)
	headerPrintf("  + Enable SSL: %t\n", c.Endpoints.Database.EnableSsl)
	headerPrintf("  + Max open connections: %d\n", c.Endpoints.Database.MaxOpenConnectionCount)
	headerPrintf("  + Max idle connections: %d\n", c.Endpoints.Database.MaxIdleConnectionCount)
}

// headerPrintf prints text with prefix
func headerPrintf(format string, a ...any) {
	fmt.Printf("[HCFG]"+format, a...)
}

// headerPrintln prints text with prefix
func headerPrintln(a string) {
	fmt.Println("[HCFG]" + a)
}

// Validate performs validation on the configuration specified in the `config.yaml` within application's home directory
func (c Config) Validate() error {
	// validate Indexing section
	if c.IndexingConfig.HotReloadInterval < time.Minute {
		return fmt.Errorf("hot-reload interval can not be less than 1 minute")
	}
	if c.IndexingConfig.UrlCheckInterval < time.Minute {
		return fmt.Errorf("Json-RPC health-check interval can not be less than 1 minute")
	}
	if c.IndexingConfig.UrlCheckInterval > 10*time.Minute {
		return fmt.Errorf("Json-RPC health-check interval can not be far more than 10 minutes")
	}
	if c.IndexingConfig.IndexBlockInterval < 3*time.Second {
		return fmt.Errorf("indexing new blocks interval can not be less than 3 seconds")
	}
	if c.IndexingConfig.IndexBlockInterval > 30*time.Second {
		return fmt.Errorf("indexing new blocks interval can not be far more than 30 seconds")
	}

	// validate Secret section
	if len(c.SecretConfig.TelegramToken) > 0 {
		if c.TelegramConfig.LogChannelID == 0 {
			return fmt.Errorf("missing telegram log channel ID")
		}
		if c.TelegramConfig.ErrChannelID == 0 {
			return fmt.Errorf("missing telegram error channel ID")
		}
	}

	// validate Logging section
	errLogCfg := c.Logging.Validate()
	if errLogCfg != nil {
		return errLogCfg
	}

	// Validate Endpoints-DB section
	errDbCfg := c.Endpoints.Database.Validate()
	if errDbCfg != nil {
		return errDbCfg
	}

	return nil
}
