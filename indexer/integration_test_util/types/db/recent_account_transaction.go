package db

import "database/sql"

type RecentAccountTransactionRecord struct {
	ChainId  string
	Height   int64
	Hash     string
	RefCount int16

	Epoch        int64
	MessageTypes []string
	Action       sql.NullString
}
