package constants

func GetTablesPartitionedByEpochWeek() []string {
	return []string{
		"transaction",
	}
}

func GetTablesPartitionedByChainId() []string {
	return []string{
		"account",
		"recent_accounts_transaction",
		"ref_account_to_recent_tx",
		"failed_block",
	}
}
