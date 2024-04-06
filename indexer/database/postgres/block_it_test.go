package postgres

import (
	"fmt"
	"math"
	"time"
)

func (suite *IntegrationTestSuite) TestDatabase_InsertOrUpdateFailedBlock_IT() {
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

//goland:noinspection SpellCheckingInspection,SqlDialectInspection,SqlNoDataSourceInspection
func (suite *IntegrationTestSuite) TestDatabase_RemoveFailedBlockRecord_IT() {
	db := suite.Database()

	originalRowsCount := suite.CountRows2("failed_block")

	firstChain := suite.DBITS.Chains.Number(1)

	err := db.RemoveFailedBlockRecord(firstChain.ChainId, 2)
	suite.Require().NoError(err)
	suite.Equal(originalRowsCount, suite.CountRows2("failed_block"), "no change")

	err = db.InsertOrUpdateFailedBlock(firstChain.ChainId, 2, fmt.Errorf("some error"))
	suite.Require().NoError(err)
	suite.Require().Equal(originalRowsCount+1, suite.CountRows2("failed_block"), "must be inserted")

	err = db.InsertOrUpdateFailedBlock(firstChain.ChainId, 3, fmt.Errorf("some error"))
	suite.Require().NoError(err)
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
