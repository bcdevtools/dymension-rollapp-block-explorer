package constants

const (
	RetryIndexingFailedBlockGapSeconds = 60
	RetryIndexingFailedBlockMaxRetries = 100
)

func GetTablesPartitionedByEpochWeek() []string {
	return []string{
		"transaction",
	}
}

func GetTablesPartitionedByEpochWeekAndChainId() []string {
	return []string{
		//"transaction",
	}
}

func GetTablesPartitionedByChainId() []string {
	return []string{
		"account",
		"recent_account_transaction",
		"ref_account_to_recent_tx",
		"failed_block",
		"ibc_transaction",
	}
}
