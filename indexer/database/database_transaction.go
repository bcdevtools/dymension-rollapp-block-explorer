package database

import dbtypes "github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/database/types"

// DbTransaction represents an abstract database transaction that can be used to CRUD, then commit or rollback on purpose
type DbTransaction interface {
	// CommitTransaction commits the current transaction instance, returns error if any problem happened using commit progress
	CommitTransaction() error
	// RollbackTransaction rollbacks the current transaction instance, returns error if any problem happened using rollback progress
	RollbackTransaction() error

	// Account

	// InsertOrUpdateRecordsAccount inserts or updates the given accounts into the database.
	// If the account is exists, it will update the account's balance on erc20 and nft contracts,
	// the list of contracts address will be appended to the existing list distinctly.
	InsertOrUpdateRecordsAccount(accounts dbtypes.RecordsAccount) error
}
