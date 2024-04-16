package cmd

import (
	"fmt"
	"github.com/bcdevtools/dymension-rollapp-block-explorer/delegation-snapshot/constants"
	"github.com/spf13/cobra"
)

var (
	printLongVersion bool
)

// versionCmd represents the version command, it prints the current version of the binary
var versionCmd = &cobra.Command{
	Use:     "version",
	Aliases: []string{"v"},
	Short:   "Show binary version",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Printf("%-11s %s\n", "Version:", constants.VERSION)
	},
}

func init() {
	rootCmd.AddCommand(versionCmd)
	versionCmd.PersistentFlags().BoolVar(
		&printLongVersion,
		"long", false, "print extra version information",
	)
}
