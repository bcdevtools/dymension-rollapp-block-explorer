package constants

func GetTablesPartitionedByWeek() []string {
	return []string{
		"transaction",
	}
}

func GetTablesPartitionedByChainId() []string {
	return []string{
		"account",
		"recent_account_transaction",
	}
}
