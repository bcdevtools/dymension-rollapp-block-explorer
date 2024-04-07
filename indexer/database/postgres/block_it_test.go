package postgres

import (
	"fmt"
	"math"
	"time"
)

//goland:noinspection SpellCheckingInspection,SqlDialectInspection,SqlNoDataSourceInspection
func (suite *IntegrationTestSuite) Test_GetSetLatestIndexedBlock_IT() {
	suite.InsertChainInfoRecords()

	db := suite.Database()

	firstChain := suite.DBITS.Chains.Number(1)
	secondChain := suite.DBITS.Chains.Number(2)

	setLatestIndexedBlock := func(chainId string, height int64) {
		_, err := db.Sql.Exec(`
UPDATE chain_info SET latest_indexed_block = $1 WHERE chain_id = $2
`,
			height,  // 1
			chainId, // 2
		)
		suite.Require().NoError(err)
	}

	setLatestIndexedBlock(firstChain.ChainId, 5)

	setLatestIndexedBlock(secondChain.ChainId, 6)

	height, err := db.GetLatestIndexedBlock(firstChain.ChainId)
	suite.Require().NoError(err)
	suite.Equal(int64(5), height)

	height, err = db.GetLatestIndexedBlock(secondChain.ChainId)
	suite.Require().NoError(err)
	suite.Equal(int64(6), height)

	setLatestIndexedBlock(firstChain.ChainId, 11)

	setLatestIndexedBlock(secondChain.ChainId, 9)

	height, err = db.GetLatestIndexedBlock(firstChain.ChainId)
	suite.Require().NoError(err)
	suite.Equal(int64(11), height)

	height, err = db.GetLatestIndexedBlock(secondChain.ChainId)
	suite.Require().NoError(err)
	suite.Equal(int64(9), height)

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
