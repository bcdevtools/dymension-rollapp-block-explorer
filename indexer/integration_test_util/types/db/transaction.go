package db

import "database/sql"

type TransactionRecord struct {
	ChainId     string
	Height      int64
	Hash        string
	PartitionId int

	Epoch        int64
	MessageTypes []string
	TxType       string
	Action       sql.NullString
}
