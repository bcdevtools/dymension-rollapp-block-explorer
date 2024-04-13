package postgres

import (
	"fmt"
	"github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/constants"
	"math"
	"time"
)

//goland:noinspection SqlNoDataSourceInspection,SqlDialectInspection
func (suite *IntegrationTestSuite) TestDatabase_GetSetLatestIndexedBlock_IT() {
	suite.InsertChainInfoRecords()

	db := suite.Database()

	firstChain := suite.DBITS.Chains.Number(1)
	secondChain := suite.DBITS.Chains.Number(2)

	err := db.SetLatestIndexedBlock(firstChain.ChainId, 5)
	suite.Require().NoError(err)

	err = db.SetLatestIndexedBlock(secondChain.ChainId, 6)
	suite.Require().NoError(err)

	height, postponed, err := db.GetLatestIndexedBlock(firstChain.ChainId)
	suite.Require().NoError(err)
	suite.Equal(int64(5), height)
	suite.False(postponed)

	height, postponed, err = db.GetLatestIndexedBlock(secondChain.ChainId)
	suite.Require().NoError(err)
	suite.Equal(int64(6), height)
	suite.False(postponed)

	err = db.SetLatestIndexedBlock(firstChain.ChainId, 3)
	suite.Require().NoError(err)

	err = db.SetLatestIndexedBlock(secondChain.ChainId, 9)
	suite.Require().NoError(err)

	_, err = db.Sql.Exec(`UPDATE chain_info SET postponed = true WHERE chain_id = $1`, firstChain.ChainId)
	suite.Require().NoError(err)

	height, postponed, err = db.GetLatestIndexedBlock(firstChain.ChainId)
	suite.Require().NoError(err)
	suite.Equal(int64(5), height, "must be the greater one")
	suite.True(postponed)

	height, postponed, err = db.GetLatestIndexedBlock(secondChain.ChainId)
	suite.Require().NoError(err)
	suite.Equal(int64(9), height, "must be the greater one")
	suite.False(postponed)
}

func (suite *IntegrationTestSuite) Test_InsertOrUpdateFailedBlocks_IT() {
	db := suite.Database()

	originalRowsCount := suite.CountRows2("failed_block")

	firstChain := suite.DBITS.Chains.Number(1)

	const height = 2

	tests := []struct {
		err               error
		wantRetryCount    int64
		wantErrorMessages []string
	}{
		{
			err:               nil,
			wantRetryCount:    0,
			wantErrorMessages: []string{},
		},
		{
			err:               nil,
			wantRetryCount:    1,
			wantErrorMessages: []string{},
		},
		{
			err:               fmt.Errorf("some error"),
			wantRetryCount:    2,
			wantErrorMessages: []string{"some error"},
		},
		{
			err:               fmt.Errorf("another error"),
			wantRetryCount:    3,
			wantErrorMessages: []string{"another error", "some error"},
		},
	}
	for i, test := range tests {
		suite.Run(fmt.Sprintf("round %d", i+1), func() {
			time.Sleep(1500 * time.Millisecond)

			err := db.InsertOrUpdateFailedBlocks(firstChain.ChainId, []int64{height}, test.err)
			suite.Require().NoError(err)

			record := suite.DBITS.ReadFailedBlockRecord(firstChain.ChainId, height, nil)
			suite.Equal(firstChain.ChainId, record.ChainId)
			suite.Equal(int64(height), record.Height)
			suite.Equal(int16(test.wantRetryCount), record.RetryCount)
			suite.Equal(test.wantErrorMessages, record.ErrorMessages)
			suite.GreaterOrEqual(float64(1), math.Abs(float64(time.Now().UTC().Unix()-record.LastRetryEpoch)))

			suite.Equal(originalRowsCount+1, suite.CountRows2("failed_block"))
		})
	}

	suite.Run("multi", func() {
		time.Sleep(1500 * time.Millisecond)

		var height2 int64 = height * 200
		var height3 int64 = height * 300

		err := db.InsertOrUpdateFailedBlocks(firstChain.ChainId, []int64{height, height2, height3}, fmt.Errorf("multi test"))
		suite.Require().NoError(err)

		record1 := suite.DBITS.ReadFailedBlockRecord(firstChain.ChainId, height, nil)
		suite.Equal(firstChain.ChainId, record1.ChainId)
		suite.Equal(int64(height), record1.Height)
		suite.Equal(int16(4), record1.RetryCount)
		suite.Equal([]string{"multi test", "another error", "some error"}, record1.ErrorMessages)
		suite.GreaterOrEqual(float64(1), math.Abs(float64(time.Now().UTC().Unix()-record1.LastRetryEpoch)))

		suite.Equal(originalRowsCount+3, suite.CountRows2("failed_block"))

		record2 := suite.DBITS.ReadFailedBlockRecord(firstChain.ChainId, height2, nil)
		suite.Equal(firstChain.ChainId, record2.ChainId)
		suite.Equal(height2, record2.Height)
		suite.Equal(int16(0), record2.RetryCount)
		suite.Equal([]string{"multi test"}, record2.ErrorMessages)
		suite.GreaterOrEqual(float64(1), math.Abs(float64(time.Now().UTC().Unix()-record2.LastRetryEpoch)))

		record3 := suite.DBITS.ReadFailedBlockRecord(firstChain.ChainId, height3, nil)
		suite.Equal(firstChain.ChainId, record3.ChainId)
		suite.Equal(height3, record3.Height)
		suite.Equal(int16(0), record3.RetryCount)
		suite.Equal([]string{"multi test"}, record3.ErrorMessages)
		suite.GreaterOrEqual(float64(1), math.Abs(float64(time.Now().UTC().Unix()-record3.LastRetryEpoch)))
	})
}

//goland:noinspection SqlNoDataSourceInspection, SqlDialectInspection
func (suite *IntegrationTestSuite) Test_GetOneFailedBlock_IT() {
	db := suite.Database()

	originalRowsCount := suite.CountRows2("failed_block")
	suite.Require().Zero(originalRowsCount)

	firstChain := suite.DBITS.Chains.Number(1)

	height, err := db.GetOneFailedBlock(firstChain.ChainId)
	suite.Require().NoError(err)
	suite.Zero(height, "must be zero when no failed block")

	err = db.InsertOrUpdateFailedBlocks(firstChain.ChainId, []int64{2, 3, 5}, nil)
	suite.Require().NoError(err)

	_, err = db.Sql.Exec("UPDATE failed_block SET last_retry_epoch = 1")
	suite.Require().NoError(err)

	height, err = db.GetOneFailedBlock(firstChain.ChainId)
	suite.Require().NoError(err)
	suite.Equal(int64(5), height, "must be the latest one")

	_, err = db.Sql.Exec("UPDATE failed_block SET retry_count = $1 WHERE height = 5", constants.RetryIndexingFailedBlockMaxRetries)
	suite.Require().NoError(err)

	height, err = db.GetOneFailedBlock(firstChain.ChainId)
	suite.Require().NoError(err)
	suite.Equal(int64(3), height, "must be the latest one which not reached max retry count")

	_, err = db.Sql.Exec("UPDATE failed_block SET last_retry_epoch = $1 WHERE height = 3", time.Now().UTC().Unix()-constants.RetryIndexingFailedBlockGapSeconds+2)
	suite.Require().NoError(err)

	height, err = db.GetOneFailedBlock(firstChain.ChainId)
	suite.Require().NoError(err)
	suite.Equal(int64(2), height, "must be the latest one which not reached max retry count and not retried recently")

	_, err = db.Sql.Exec("UPDATE failed_block SET retry_count = $1", constants.RetryIndexingFailedBlockMaxRetries)
	suite.Require().NoError(err)

	height, err = db.GetOneFailedBlock(firstChain.ChainId)
	suite.Require().NoError(err)
	suite.Zero(height, "must be zero when no failed block satisfy conditions")
}

//goland:noinspection SpellCheckingInspection,SqlDialectInspection,SqlNoDataSourceInspection
func (suite *IntegrationTestSuite) Test_RemoveFailedBlockRecord_IT() {
	db := suite.Database()

	originalRowsCount := suite.CountRows2("failed_block")

	firstChain := suite.DBITS.Chains.Number(1)

	insertFailedBlock := func(height int64) {
		_, err := db.Sql.Exec(`
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

	err := db.RemoveFailedBlockRecord(firstChain.ChainId, 2)
	suite.Require().NoError(err)
	suite.Equal(originalRowsCount, suite.CountRows2("failed_block"), "no change")

	insertFailedBlock(2)
	suite.Require().Equal(originalRowsCount+1, suite.CountRows2("failed_block"), "must be inserted")

	insertFailedBlock(3)
	suite.Require().Equal(originalRowsCount+2, suite.CountRows2("failed_block"), "must be inserted")

	err = db.RemoveFailedBlockRecord(firstChain.ChainId, 2)
	suite.Require().NoError(err)
	suite.Equal(originalRowsCount+1, suite.CountRows2("failed_block"), "must be reduced by 1")

	suite.Equal(
		1,
		suite.readCountResult(
			db.Sql.Query("SELECT COUNT(1) FROM failed_block WHERE chain_id = $1 AND height = $2", firstChain.ChainId, 3),
		),
		"the rest record should be still there",
	)
	suite.Zero(
		suite.readCountResult(
			db.Sql.Query("SELECT COUNT(1) FROM failed_block WHERE chain_id = $1 AND height = $2", firstChain.ChainId, 2),
		),
		"the deleted record should not be there anymore",
	)
}
