package pg_db_tx

import (
	"time"
)

//goland:noinspection SpellCheckingInspection,SqlDialectInspection,SqlNoDataSourceInspection
func (suite *IntegrationTestSuite) TestDatabase_RemoveFailedBlockRecord_IT() {
	tx, _ := suite.TX()

	originalRowsCount := suite.CountRows(tx.Tx, "failed_block")

	firstChain := suite.DBITS.Chains.Number(1)

	insertFailedBlock := func(height int64) {
		_, err := tx.ExecWithContext(`
INSERT INTO failed_block(chain_id, height, last_retry_epoch)
VALUES ($1, $2, $3)
ON CONFLICT(chain_id, height) DO NOTHING
`,
			firstChain.ChainId,      // 1
			height,                  // 2
			time.Now().UTC().Unix(), // 3
		)
		suite.Require().NoError(err)
	}

	err := tx.RemoveFailedBlockRecord(firstChain.ChainId, 2)
	suite.Require().NoError(err)
	suite.Equal(originalRowsCount, suite.CountRows(tx.Tx, "failed_block"), "no change")

	insertFailedBlock(2)
	suite.Require().Equal(originalRowsCount+1, suite.CountRows(tx.Tx, "failed_block"), "must be inserted")

	insertFailedBlock(3)
	suite.Require().Equal(originalRowsCount+2, suite.CountRows(tx.Tx, "failed_block"), "must be inserted")

	err = tx.RemoveFailedBlockRecord(firstChain.ChainId, 2)
	suite.Require().NoError(err)
	suite.Equal(originalRowsCount+1, suite.CountRows(tx.Tx, "failed_block"), "must be reduced by 1")

	suite.Equal(
		1,
		suite.readCountResult(
			tx.Tx.Query("SELECT COUNT(1) FROM failed_block WHERE chain_id = $1 AND height = $2", firstChain.ChainId, 3),
		),
		"the rest record should be still there",
	)
	suite.Zero(
		suite.readCountResult(
			tx.Tx.Query("SELECT COUNT(1) FROM failed_block WHERE chain_id = $1 AND height = $2", firstChain.ChainId, 2),
		),
		"the deleted record should not be there anymore",
	)
}
