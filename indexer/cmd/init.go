package cmd

import (
	"fmt"
	libutils "github.com/EscanBE/go-lib/utils"
	cmdutils "github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/cmd/utils"
	"github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/constants"
	"github.com/spf13/cobra"
	"os"
	"path"
)

// initCmd represents the init command, to be used to generate home directory with configuration file named `config.yaml`
var initCmd = &cobra.Command{
	Use:   "init",
	Short: fmt.Sprintf("Init home directory & configuration files for %s at %s", constants.APP_NAME, cmdutils.GetDefaultHomeDirectory()),
	Run: func(cmd *cobra.Command, args []string) {
		_, err := os.Stat(homeDir)

		if err != nil && os.IsNotExist(err) {
			fmt.Printf("Require home dir '%s' does not exists, going to create new home dir\n", homeDir)
			err := os.Mkdir(homeDir, 0o750)
			libutils.ExitIfErr(err, fmt.Sprintf("Unable to create home dir %s", homeDir))
		} else if err != nil {
			cobra.CheckErr(err)
		}

		initConfigFile()
		initChainListFile()

		fmt.Println("Done")
	},
}

func initConfigFile() {
	cfgFile := path.Join(homeDir, constants.DEFAULT_CONFIG_FILE_NAME)

	_, err := os.Stat(cfgFile)
	if err != nil && os.IsNotExist(err) {
		fmt.Printf("Config file '%s' does not exists, going to create new file with permission %s\n", cfgFile, constants.FILE_PERMISSION_STR)
		file, err := os.Create(cfgFile)
		libutils.ExitIfErr(err, fmt.Sprintf("Unable to create config file %s", cfgFile))
		err = file.Chmod(constants.FILE_PERMISSION)
		libutils.ExitIfErr(err, fmt.Sprintf("Unable to set permission for new config file %s to %s", cfgFile, constants.FILE_PERMISSION_STR))
		_, err = file.WriteString(
			// trailing style: 2 spaces
			fmt.Sprintf(`# %s's configuration file
indexing:
  hot-reload: 3m # interval reload configuration
  url-check: 5m # interval health-check Json-RPC urls
  index-block: 10s # interval indexing new block each chain
  disable-retry-failed-blocks: false
logging:
  level: info # debug || info || error
  format: text # text || json
secrets:
  telegram-token: # leave it empty to disable telegram, but it will crash if you invoke function to send message
endpoints:
  db: # database connection
    name: postgres
    host: 127.0.0.1
    port: 5432
    username: postgres
    password: 1234567
    schema: public
    enable-ssl: false
    max-open-connection-count: 20
    max-idle-connection-count: 20
telegram:
  log-channel-id: 0
  error-channel-id: 0
`, constants.APP_NAME))
		libutils.ExitIfErr(err, fmt.Sprintf("Unable to write content for new config file %s", cfgFile))
	} else if err != nil {
		cobra.CheckErr(err)
	}
}

func initChainListFile() {
	chainsFile := path.Join(homeDir, constants.DEFAULT_CHAIN_LIST_FILE_NAME)

	_, err := os.Stat(chainsFile)
	if err != nil && os.IsNotExist(err) {
		fmt.Printf("Chain list file '%s' does not exists, going to create new file with permission %s\n", chainsFile, constants.FILE_PERMISSION_STR)
		file, err := os.Create(chainsFile)
		libutils.ExitIfErr(err, fmt.Sprintf("Unable to create Chain list file %s", chainsFile))
		err = file.Chmod(constants.FILE_PERMISSION)
		libutils.ExitIfErr(err, fmt.Sprintf("Unable to set permission for new Chain list file %s to %s", chainsFile, constants.FILE_PERMISSION_STR))
		_, err = file.WriteString(
			// trailing style: 2 spaces
			`
evil:
  chain_id: evil_8363-1
  be_json_rpc_urls: [ "http://localhost:11100" ]
  # disable: true
worm:
  chain_id: worm_8383-1
  be_json_rpc_urls: [ "http://localhost:11102" ]
  # disable: true
`)
		libutils.ExitIfErr(err, fmt.Sprintf("Unable to write content for new Chain list file %s", chainsFile))
	} else if err != nil {
		cobra.CheckErr(err)
	}
}

func init() {
	rootCmd.AddCommand(initCmd)
}
