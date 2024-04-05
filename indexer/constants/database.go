package constants

func GetTablesPartitionedByEpochWeek() []string {
	return []string{
		"transaction",
	}
}

func GetTablesPartitionedByChainId() []string {
	return []string{
		"account",
		"account_erc20_balance",
		"account_nft_balance",
		"recent_accounts_transaction",
		"ref_account_to_recent_tx",
	}
}
