package cmd

import (
	"fmt"
	libapp "github.com/EscanBE/go-lib/app"
	libcons "github.com/EscanBE/go-lib/constants"
	"github.com/EscanBE/go-lib/logging"
	logtypes "github.com/EscanBE/go-lib/logging/types"
	libutils "github.com/EscanBE/go-lib/utils"
	"github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/constants"
	"github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/database/postgres"
	"github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/types"
	indexer "github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/work/per_chain_indexer"
	"github.com/spf13/cobra"
	"os"
	"os/signal"
	"sync"
	"time"
)

var (
	waitGroup sync.WaitGroup
)

// startCmd represents the start command, it launches the main business logic of this app
var startCmd = &cobra.Command{
	Use:     "start-index",
	Aliases: []string{"start"},
	Short:   "Start indexing data from multiple blockchains network",
	Run: func(cmd *cobra.Command, args []string) {
		conf, err := loadConfig(homeDir)
		libutils.ExitIfErr(err, "unable to load configuration")

		chainList, err := loadChainList(homeDir)
		libutils.ExitIfErr(err, "unable to load chain list configuration")

		// Perform validation
		err = conf.Validate()
		libutils.ExitIfErr(err, "failed to validate configuration")

		err = chainList.Validate()
		libutils.ExitIfErr(err, "failed to validate chain list")

		ctx := types.NewContext()

		// Initialize logger
		logger := logging.NewDefaultLogger()
		err = logger.ApplyConfig(conf.Logging)
		libutils.ExitIfErr(err, "failed to apply logging config")
		ctx = ctx.WithLogger(logger)

		// Initialize bot
		telegramBot, err := types.NewTelegramBot(
			conf.SecretConfig.TelegramToken,
			conf.TelegramConfig.LogChannelID,
			conf.TelegramConfig.ErrChannelID,
		)
		libutils.ExitIfErr(err, "failed to initialize Telegram bot")
		telegramBot = telegramBot.WithLogger(logger).EnableDebug(conf.Logging.Level == logtypes.LOG_LEVEL_DEBUG)
		ctx = ctx.WithTelegramBot(telegramBot)

		// Initialize database connection
		db, err := postgres.NewPostgresDatabase(conf.Endpoints.Database, logger)
		libutils.ExitIfErr(err, "unable to create new database client")
		ctx = ctx.WithDatabase(db)

		ctx = ctx.Sealed()
		logger.Debug("Application starts")

		_, _ = telegramBot.SendTelegramLogMessage(fmt.Sprintf("[%s] Application Start", constants.APP_NAME))

		// Increase the waitGroup by one and decrease within trapExitSignal
		waitGroup.Add(1)

		// Register the function which should be executed upon exit.
		// After register, when you want to clean-up things before exit,
		// call libapp.ExecuteExitFunction(ctx) the same was as trapExitSignal method did
		libapp.RegisterExitFunction(func(params ...any) {
			// finalize
			defer waitGroup.Done()
			logger.Debug("defer waitGroup::Done")

			// Implements close connection, resources,... here to prevent resource leak

			if telegramBot != nil {
				telegramBot.StopReceivingUpdates()
			}
		})

		// Listen for and trap any OS signal to gracefully shutdown and exit
		trapExitSignal(ctx)

		// Create workers

		indexerManager := indexer.NewIndexerManager(ctx)
		indexerManager.Reload(chainList)

		go func() {
			defer libapp.TryRecoverAndExecuteExitFunctionIfRecovered(logger)

			for true {
				time.Sleep(30 * time.Second)

				chainList, err := loadChainList(homeDir)
				if err != nil {
					logger.Error("chain list invalid, hot-reload failed", "error", err.Error())
					continue
				}

				indexerManager.Reload(chainList)
				time.Sleep(90 * time.Second)
			}
		}()

		// end
		waitGroup.Wait()
	},
}

func init() {
	rootCmd.AddCommand(startCmd)
}

// trapExitSignal traps the signal which being emitted when interrupting the application. Implement connection/resource close to prevent resource leaks
func trapExitSignal(ctx types.Context) {
	var sigCh = make(chan os.Signal)

	signal.Notify(sigCh, libcons.TrapExitSignals...)

	go func() {
		sig := <-sigCh
		ctx.GetLogger().Info(
			"caught signal; shutting down...",
			"os.signal", sig.String(),
		)

		libapp.ExecuteExitFunction()
	}()
}
