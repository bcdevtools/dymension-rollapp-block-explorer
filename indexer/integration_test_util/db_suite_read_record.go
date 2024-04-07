package integration_test_util

//goland:noinspection SpellCheckingInspection
import (
	"database/sql"
	itutildbtypes "github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/integration_test_util/types/db"
	"github.com/lib/pq"
)

// ReadChainInfoRecord reads a specific chain info record from `chain_info` table in database.
//
//goland:noinspection SqlNoDataSourceInspection,SqlDialectInspection,SpellCheckingInspection
func (suite *DatabaseIntegrationTestSuite) ReadChainInfoRecord(chainId string, optionalTx *sql.Tx) itutildbtypes.ChainInfoRecord {
	statement := `
SELECT
	chain_id, -- 1
	"name", -- 2
	chain_type, -- 3
	bech32, -- 4
	denoms, -- 5
	be_json_rpc_urls, -- 6
	latest_indexed_block -- 7
FROM chain_info WHERE chain_id = $1
`

	var rows *sql.Rows
	var err error
	if optionalTx == nil {
		rows, err = suite.Database.Query(statement, chainId)
	} else {
		rows, err = optionalTx.Query(statement, chainId)
	}

	suite.Require().NoError(err, "failed to query chain info")
	defer func() {
		_ = rows.Close()
	}()
	suite.Require().Truef(rows.Next(), "no record found for chain %s", chainId)

	var res itutildbtypes.ChainInfoRecord

	err = rows.Scan(
		&res.ChainId,                 // 1
		&res.Name,                    // 2
		&res.ChainType,               // 3
		&res.Bech32Json,              // 4
		&res.DenomsJson,              // 5
		pq.Array(&res.BeJsonRpcUrls), // 6
		&res.LatestIndexedBlock,      // 7
	)

	suite.Require().NoError(err, "failed to scan chain info")
	suite.Require().Falsef(rows.Next(), "more than one record found for chain %s", chainId)

	return res
}

// ReadAccountRecord reads a specific account record from `account` table in database.
//
//goland:noinspection SqlNoDataSourceInspection,SqlDialectInspection,SpellCheckingInspection
func (suite *DatabaseIntegrationTestSuite) ReadAccountRecord(chainId, bech32Address string, optionalTx *sql.Tx) itutildbtypes.AccountRecord {
	statement := `
SELECT
	chain_id, -- 1
	bech32_address, -- 2
	continous_insert_ref_cur_tx_counter, -- 3
	balance_on_erc20_contracts, -- 4
	balance_on_nft_contracts -- 5
FROM account WHERE chain_id = $1 AND bech32_address = $2
`
	var rows *sql.Rows
	var err error
	if optionalTx == nil {
		rows, err = suite.Database.Query(statement, chainId, bech32Address)
	} else {
		rows, err = optionalTx.Query(statement, chainId, bech32Address)
	}

	suite.Require().NoError(err, "failed to query account")
	defer func() {
		_ = rows.Close()
	}()
	suite.Require().Truef(rows.Next(), "no record found for account %s at %s", chainId, bech32Address)

	var res itutildbtypes.AccountRecord

	err = rows.Scan(
		&res.ChainId,       // 1
		&res.Bech32Address, // 2
		&res.ContinousInsertReferenceCurrentTxCounter, // 3
		pq.Array(&res.BalanceOnErc20Contracts),        // 4
		pq.Array(&res.BalanceOnNftContracts),          // 5
	)

	suite.Require().NoError(err, "failed to scan account")
	suite.Require().Falsef(rows.Next(), "more than one record found for account %s at %s", chainId, bech32Address)

	return res
}

// ReadTransactionRecord reads a specific transaction record from `transaction` table in database.
//
//goland:noinspection SqlNoDataSourceInspection,SqlDialectInspection,SpellCheckingInspection
func (suite *DatabaseIntegrationTestSuite) ReadTransactionRecord(hash string, height int64, chainId string, optionalTx *sql.Tx) itutildbtypes.TransactionRecord {
	statement := `
SELECT
    chain_id, -- 1
	height, -- 2
	hash, -- 3
	partition_id, -- 4
	epoch, -- 5
	message_types, -- 6
	tx_type -- 7
FROM "transaction" WHERE hash = $1 AND height = $2 AND chain_id = $3
`

	var rows *sql.Rows
	var err error
	if optionalTx == nil {
		rows, err = suite.Database.Query(statement, hash, height, chainId)
	} else {
		rows, err = optionalTx.Query(statement, hash, height, chainId)
	}

	suite.Require().NoError(err, "failed to query transaction")
	defer func() {
		_ = rows.Close()
	}()
	suite.Require().Truef(rows.Next(), "no record found for transaction %s at %d", hash, height)

	var res itutildbtypes.TransactionRecord

	err = rows.Scan(
		&res.ChainId,                // 1
		&res.Height,                 // 2
		&res.Hash,                   // 3
		&res.PartitionId,            // 4
		&res.Epoch,                  // 5
		pq.Array(&res.MessageTypes), // 6
		&res.TxType,                 // 7
	)
	suite.Require().NoError(err, "failed to scan transaction")
	suite.Require().Falsef(rows.Next(), "more than one record found for transaction %s at %d", hash, height)

	return res
}

// ReadRecentAccountTransactionRecord reads a specific transaction record from `recent_account_transaction` table in database.
//
//goland:noinspection SqlNoDataSourceInspection,SqlDialectInspection,SpellCheckingInspection
func (suite *DatabaseIntegrationTestSuite) ReadRecentAccountTransactionRecord(hash string, height int64, chainId string, optionalTx *sql.Tx) itutildbtypes.RecentAccountTransactionRecord {
	statement := `
SELECT
    chain_id, -- 1
	height, -- 2
	hash, -- 3
	ref_count, -- 4
	epoch, -- 5
	message_types -- 6
FROM recent_account_transaction WHERE hash = $1 AND height = $2 AND chain_id = $3
`

	var rows *sql.Rows
	var err error
	if optionalTx == nil {
		rows, err = suite.Database.Query(statement, hash, height, chainId)
	} else {
		rows, err = optionalTx.Query(statement, hash, height, chainId)
	}

	suite.Require().NoError(err, "failed to query recent account transaction")
	defer func() {
		_ = rows.Close()
	}()
	suite.Require().Truef(rows.Next(), "no record found for recent account transaction %s at %d", hash, height)

	var res itutildbtypes.RecentAccountTransactionRecord

	err = rows.Scan(
		&res.ChainId,                // 1
		&res.Height,                 // 2
		&res.Hash,                   // 3
		&res.RefCount,               // 4
		&res.Epoch,                  // 5
		pq.Array(&res.MessageTypes), // 6
	)
	suite.Require().NoError(err, "failed to scan recent account transaction")
	suite.Require().Falsef(rows.Next(), "more than one record found for recent account transaction %s at %d", hash, height)

	return res
}

// ReadReducedRefCountRecentAccountTransactionRecord reads a specific transaction record from `reduced_ref_count_recent_account_transaction` table in database.
//
//goland:noinspection SqlNoDataSourceInspection,SqlDialectInspection,SpellCheckingInspection
func (suite *DatabaseIntegrationTestSuite) ReadReducedRefCountRecentAccountTransactionRecord(hash string, height int64, chainId string, optionalTx *sql.Tx) itutildbtypes.ReducedRefCountRecentAccountTransactionRecord {
	statement := `
SELECT
    chain_id, -- 1
	height, -- 2
	hash, -- 3
FROM recent_account_transaction WHERE hash = $1 AND height = $2 AND chain_id = $3
`

	var rows *sql.Rows
	var err error
	if optionalTx == nil {
		rows, err = suite.Database.Query(statement, hash, height, chainId)
	} else {
		rows, err = optionalTx.Query(statement, hash, height, chainId)
	}

	suite.Require().NoError(err, "failed to query recent account transaction")
	defer func() {
		_ = rows.Close()
	}()
	suite.Require().Truef(rows.Next(), "no record found for recent account transaction %s at %d", hash, height)

	var res itutildbtypes.ReducedRefCountRecentAccountTransactionRecord

	err = rows.Scan(
		&res.ChainId, // 1
		&res.Height,  // 2
		&res.Hash,    // 3
	)
	suite.Require().NoError(err, "failed to scan recent account transaction")
	suite.Require().Falsef(rows.Next(), "more than one record found for recent account transaction %s at %d", hash, height)

	return res
}

// ReadRefAccountToRecentTxRecord reads a specific ref account to recent tx record from `ref_account_to_recent_tx` table in database.
//
//goland:noinspection SqlNoDataSourceInspection,SqlDialectInspection,SpellCheckingInspection
func (suite *DatabaseIntegrationTestSuite) ReadRefAccountToRecentTxRecord(bech32Address, hash string, height int64, chainId string, optionalTx *sql.Tx) itutildbtypes.RefAccountToRecentTxRecord {
	statement := `
SELECT
    chain_id, -- 1
	bech32_address, -- 2
	height, -- 3
	hash, -- 4
	signer, -- 5
	erc20, -- 6
	nft -- 7
FROM ref_account_to_recent_tx WHERE bech32_address = $1 AND hash = $2 AND height = $3 AND chain_id = $4
`

	var rows *sql.Rows
	var err error
	if optionalTx == nil {
		rows, err = suite.Database.Query(statement, bech32Address, hash, height, chainId)
	} else {
		rows, err = optionalTx.Query(statement, bech32Address, hash, height, chainId)
	}

	suite.Require().NoError(err, "failed to query ref account to recent tx")
	defer func() {
		_ = rows.Close()
	}()
	suite.Require().Truef(rows.Next(), "no record found for ref account to recent tx %s at %d for account %s", hash, height, bech32Address)

	var res itutildbtypes.RefAccountToRecentTxRecord

	err = rows.Scan(
		&res.ChainId,       // 1
		&res.Bech32Address, // 2
		&res.Height,        // 3
		&res.Hash,          // 4
		&res.Signer,        // 5
		&res.Erc20,         // 6
		&res.NFT,           // 7
	)
	suite.Require().NoError(err, "failed to scan ref account to recent tx")
	suite.Require().Falsef(rows.Next(), "more than one record found for ref account to recent tx %s at %d for account", hash, height, bech32Address)

	return res
}

// ReadFailedBlockRecord reads a specific failed block record from `failed_block` table in database.
//
//goland:noinspection SqlNoDataSourceInspection,SqlDialectInspection,SpellCheckingInspection
func (suite *DatabaseIntegrationTestSuite) ReadFailedBlockRecord(chainId string, height int64, optionalTx *sql.Tx) itutildbtypes.FailedBlockRecord {
	statement := `
SELECT
	chain_id, -- 1
	height, -- 2
	retry_count, -- 3
	last_retry_epoch, -- 4
	error_messages -- 5
FROM failed_block WHERE chain_id = $1 AND height = $2
`

	var rows *sql.Rows
	var err error
	if optionalTx == nil {
		rows, err = suite.Database.Query(statement, chainId, height)
	} else {
		rows, err = optionalTx.Query(statement, chainId, height)
	}

	suite.Require().NoError(err, "failed to query failed block")

	defer func() {
		_ = rows.Close()
	}()

	suite.Require().Truef(rows.Next(), "no record found for failed block %s at %d", chainId, height)

	var res itutildbtypes.FailedBlockRecord

	err = rows.Scan(
		&res.ChainId,                 // 1
		&res.Height,                  // 2
		&res.RetryCount,              // 3
		&res.LastRetryEpoch,          // 4
		pq.Array(&res.ErrorMessages), // 5
	)

	suite.Require().NoError(err, "failed to scan failed block")
	suite.Require().Falsef(rows.Next(), "more than one record found for failed block %s at %d", chainId, height)

	return res
}
