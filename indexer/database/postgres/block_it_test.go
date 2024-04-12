package postgres

import (
	"fmt"
	"github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/constants"
	"math"
	"time"
)

func (suite *IntegrationTestSuite) TestDatabase_GetSetLatestIndexedBlock_IT() {
	suite.InsertChainInfoRecords()

	db := suite.Database()

	firstChain := suite.DBITS.Chains.Number(1)
	secondChain := suite.DBITS.Chains.Number(2)

	err := db.SetLatestIndexedBlock(firstChain.ChainId, 5)
	suite.Require().NoError(err)

	err = db.SetLatestIndexedBlock(secondChain.ChainId, 6)
	suite.Require().NoError(err)

	height, err := db.GetLatestIndexedBlock(firstChain.ChainId)
	suite.Require().NoError(err)
	suite.Equal(int64(5), height)

	height, err = db.GetLatestIndexedBlock(secondChain.ChainId)
	suite.Require().NoError(err)
	suite.Equal(int64(6), height)

	err = db.SetLatestIndexedBlock(firstChain.ChainId, 3)
	suite.Require().NoError(err)

	err = db.SetLatestIndexedBlock(secondChain.ChainId, 9)
	suite.Require().NoError(err)

	height, err = db.GetLatestIndexedBlock(firstChain.ChainId)
	suite.Require().NoError(err)
	suite.Equal(int64(5), height, "must be the greater one")

	height, err = db.GetLatestIndexedBlock(secondChain.ChainId)
	suite.Require().NoError(err)
	suite.Equal(int64(9), height, "must be the greater one")
}

func (suite *IntegrationTestSuite) Test_InsertOrUpdateFailedBlock_IT() {
	db := suite.Database()

	originalRowsCount := suite.CountRows2("failed_block")

	firstChain := suite.DBITS.Chains.Number(1)

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

			err := db.InsertOrUpdateFailedBlock(firstChain.ChainId, 2, test.err)
			suite.Require().NoError(err)

			record := suite.DBITS.ReadFailedBlockRecord(firstChain.ChainId, 2, nil)
			suite.Equal(firstChain.ChainId, record.ChainId)
			suite.Equal(int64(2), record.Height)
			suite.Equal(int16(test.wantRetryCount), record.RetryCount)
			suite.Equal(test.wantErrorMessages, record.ErrorMessages)
			suite.GreaterOrEqual(float64(1), math.Abs(float64(time.Now().UTC().Unix()-record.LastRetryEpoch)))

			suite.Equal(originalRowsCount+1, suite.CountRows2("failed_block"))
		})
	}
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

	err = db.InsertOrUpdateFailedBlock(firstChain.ChainId, 2, nil)
	suite.Require().NoError(err)

	err = db.InsertOrUpdateFailedBlock(firstChain.ChainId, 3, nil)
	suite.Require().NoError(err)

	err = db.InsertOrUpdateFailedBlock(firstChain.ChainId, 5, nil)
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
