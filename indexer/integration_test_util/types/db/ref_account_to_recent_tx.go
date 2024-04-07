package db

import "database/sql"

type RefAccountToRecentTxRecord struct {
	ChainId       string
	Bech32Address string
	Height        int64
	Hash          string

	Signer sql.NullBool
	Erc20  sql.NullBool
	NFT    sql.NullBool
}
