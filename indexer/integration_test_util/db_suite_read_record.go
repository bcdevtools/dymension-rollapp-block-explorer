package integration_test_util

//goland:noinspection SpellCheckingInspection
import (
	"database/sql"
	itutildbtypes "github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/integration_test_util/types/db"
)

// ReadTransactionRecord reads a specific transaction record from transaction table in database.
//
//goland:noinspection SqlNoDataSourceInspection,SqlDialectInspection
func (suite *DatabaseIntegrationTestSuite) ReadTransactionRecord(hash string, height int64, chainId string, optionalTx *sql.Tx) itutildbtypes.TransactionRecord {
	//goland:noinspection SpellCheckingInspection
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
