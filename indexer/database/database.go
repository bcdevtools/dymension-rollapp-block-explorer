package database

import (
	"context"
	dbtypes "github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/database/types"
	_ "github.com/lib/pq"
)

// Database represents an abstract database that can be used to CRUD
type Database interface {
	// BeginDatabaseTransaction will start a database transaction, then you can perform CRUD on it, finally can do commit or rollback on purpose
	BeginDatabaseTransaction(ctx context.Context) (DbTransaction, error)

	// CommitTransaction performs committing the db transaction into store
	CommitTransaction(ptx DbTransaction) error

	// RollbackTransaction performs rolling back changes made by the db transaction
	RollbackTransaction(ptx DbTransaction) error

	// Close closes the underlying database connection
	Close()

	// Partitioning

	// PreparePartitionedTablesForChainId create partitioned tables for the corresponding chain-id.
	PreparePartitionedTablesForChainId(chainId string) error

	// PreparePartitionedTablesForEpochAndChainId create partitioned tables for the corresponding epoch UTC and chain-id.
	PreparePartitionedTablesForEpochAndChainId(epochUtcSeconds int64, chainId string) error

	// Chains info

	// InsertOrUpdateRecordChainInfo inserts a new chain info record into the database.
	// If the chain info already exists, it will be updated.
	InsertOrUpdateRecordChainInfo(chainInfo dbtypes.RecordChainInfo) (insertedOrUpdated bool, err error)

	// UpdateBeJsonRpcUrlsIfExists updates the be_json_rpc_urls field of the chain info record with the given chain ID.
	// If the chain info does not exist, nothing will be updated.
	UpdateBeJsonRpcUrlsIfExists(chainId string, urls []string) (updated bool, err error)

	// GetBech32Config returns the bech32 config of the chain info record with the given chain ID.
	GetBech32Config(chainId string) (bech32Cfg dbtypes.Bech32PrefixOfChainInfo, err error)

	// IsChainPostponed returns true if the chain is postponed. If the chain is not exists, it returns false.
	IsChainPostponed(chainId string) (postponed bool, err error)

	// GetLatestIndexedBlock returns the latest indexed block height of the chain info record with the given chain ID.
	GetLatestIndexedBlock(chainId string) (height int64, postponed bool, err error)

	// SetLatestIndexedBlock updates the latest indexed block height of the chain info record with the given chain ID.
	SetLatestIndexedBlock(chainId string, height int64) error

	// Failed blocks

	// InsertOrUpdateFailedBlocks inserts a batch of failed block records into the database.
	// If the record is already present, the logic fields will be updated.
	InsertOrUpdateFailedBlocks(chainId string, blocksHeight []int64, optionalReason error) error

	// GetOneFailedBlock returns the height of a failed block record of the chain with the given chain ID.
	GetOneFailedBlock(chainId string) (height int64, err error)

	// GetFailedBlocksInRange returns the heights of failed block records in the given range, inclusive.
	GetFailedBlocksInRange(chainId string, from, to int64) (blocksHeight []int64, err error)

	// RemoveFailedBlockRecord removes a failed block record from the database.
	// Typically, this is used when the failed block is successfully processed.
	RemoveFailedBlockRecord(chainId string, height int64) error
}
