package db

type AccountRecord struct {
	ChainId                                  string
	Bech32Address                            string
	ContinousInsertReferenceCurrentTxCounter int16
	BalanceOnErc20Contracts                  []string
	BalanceOnNftContracts                    []string
}
