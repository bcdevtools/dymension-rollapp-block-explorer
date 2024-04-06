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
		&res.ChainId,      // 1
		&res.Height,       // 2
		&res.Hash,         // 3
		&res.PartitionId,  // 4
		&res.Epoch,        // 5
		&res.MessageTypes, // 6
		&res.TxType,       // 7
	)
	suite.Require().NoError(err, "failed to scan transaction")
	suite.Require().Falsef(rows.Next(), "more than one record found for transaction %s at %d", hash, height)

	return res
}
