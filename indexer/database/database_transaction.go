package database

import dbtypes "github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/database/types"

// DbTransaction represents an abstract database transaction that can be used to CRUD, then commit or rollback on purpose
type DbTransaction interface {
	// CommitTransaction commits the current transaction instance, returns error if any problem happened using commit progress
	CommitTransaction() error
	// RollbackTransaction rollbacks the current transaction instance, returns error if any problem happened using rollback progress
	RollbackTransaction() error

	// Chain info

	// SetLatestIndexedBlock updates the latest indexed block height of the chain info record with the given chain ID.
	SetLatestIndexedBlock(chainId string, height int64) error

	// Account

	// InsertOrUpdateRecordsAccount inserts or updates the given accounts into the database.
	// If the account is exists, it will update the account's balance on erc20 and nft contracts,
	// the list of contracts address will be appended to the existing list distinctly.
	InsertOrUpdateRecordsAccount(accounts dbtypes.RecordsAccount) error

	// Transaction

	// InsertRecordTransactionsIfNotExists inserts the given transactions into the database.
	// If the transaction is exists, it will do nothing.
	InsertRecordTransactionsIfNotExists(txs dbtypes.RecordsTransaction) error

	// InsertRecordsRecentAccountTransactionIfNotExists inserts the given recent account transactions into the database.
	// If the transaction is exists, it will do nothing.
	InsertRecordsRecentAccountTransactionIfNotExists(txs dbtypes.RecordsRecentAccountTransaction) error

	// InsertRecordsRefAccountToRecentTxIfNotExists inserts the given references of account to recent transaction into the database.
	// If the reference is exists, it will do nothing.
	// The record connects the recent account transaction with the account that has the transaction.
	InsertRecordsRefAccountToRecentTxIfNotExists(refs dbtypes.RecordsRefAccountToRecentTx) error

	// CleanupZeroRefCountRecentAccountTransaction call procedures to clean-up `recent_account_transaction` records
	// which have zero referent (`ref_account_to_recent_tx`).
	CleanupZeroRefCountRecentAccountTransaction() error

	// Failed blocks

	// RemoveFailedBlockRecord removes a failed block record from the database.
	// Typically, this is used when the failed block is successfully processed.
	RemoveFailedBlockRecord(chainId string, height int64) error
}
