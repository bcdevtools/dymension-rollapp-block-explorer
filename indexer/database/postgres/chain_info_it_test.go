package postgres

import (
	"fmt"
	dbtypes "github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/database/types"
)

func (suite *IntegrationTestSuite) Test_InsertOrUpdateRecordChainInfo_IT() {
	db := suite.Database()

	originalRowsCount := suite.CountRows2("chain_info")

	firstChain := suite.DBITS.Chains.Number(1)

	originalRecord := dbtypes.RecordChainInfo{
		ChainId:            firstChain.ChainId,
		Name:               firstChain.ChainId,
		ChainType:          fmt.Sprintf("evm-%d", randomPositiveInt64()),
		Bech32:             `{"a": "b"}`,
		Denoms:             `{"1": "2"}`,
		BeJsonRpcUrls:      []string{"1", "2", "3"},
		LatestIndexedBlock: 9,
	}

	insertedOrUpdated, err := db.InsertOrUpdateRecordChainInfo(originalRecord)
	suite.Require().NoError(err)
	suite.Require().True(insertedOrUpdated)

	suite.Run("record is inserted correctly", func() {
		record := suite.DBITS.ReadChainInfoRecord(firstChain.ChainId, nil)
		suite.Equal(originalRecord.ChainId, record.ChainId)
		suite.Equal(originalRecord.Name, record.Name)
		suite.Equal(originalRecord.ChainType, record.ChainType)
		suite.Equal(`{"a": "b"}`, record.Bech32Json)
		suite.Equal(`{"1": "2"}`, record.DenomsJson)
		suite.Equal(originalRecord.BeJsonRpcUrls, record.BeJsonRpcUrls)
		suite.Equal(int64(0), record.LatestIndexedBlock, "latest indexed block should be 0 for the first time")

		suite.Equal(originalRowsCount+1, suite.CountRows2("chain_info"))
		originalRowsCount++
	})

	suite.Run("inserting the same record again should update", func() {
		newRecord := dbtypes.RecordChainInfo{
			ChainId:            firstChain.ChainId,
			Name:               firstChain.ChainId + "-altered",
			ChainType:          fmt.Sprintf("evm-%d", randomPositiveInt64()),
			Bech32:             `{"c": "d"}`,
			Denoms:             `{"1": "2", "3": "4"}`,
			BeJsonRpcUrls:      []string{"4"},
			LatestIndexedBlock: randomPositiveInt64() + 1,
		}
		insertedOrUpdated, err = db.InsertOrUpdateRecordChainInfo(newRecord)
		suite.Require().NoError(err)
		suite.Require().True(insertedOrUpdated)

		record := suite.DBITS.ReadChainInfoRecord(firstChain.ChainId, nil)
		suite.Equal(originalRecord.ChainId, record.ChainId)
		suite.Equal(originalRecord.Name, record.Name, "name change must be ignored")
		suite.Equal(newRecord.ChainType, record.ChainType, "chain type should be updated")
		suite.Equal(newRecord.Bech32, record.Bech32Json, "bech32 should be updated")
		suite.Equal(newRecord.Denoms, record.DenomsJson, "denoms should be updated")
		suite.Equal(newRecord.BeJsonRpcUrls, record.BeJsonRpcUrls, "be json rpc urls should be updated")
		suite.Equal(int64(0), record.LatestIndexedBlock, "latest indexed block should kept, regardless")

		suite.Equal(originalRowsCount, suite.CountRows2("chain_info"))
	})
}

func (suite *IntegrationTestSuite) Test_UpdateBeJsonRpcUrlsIfExists_IT() {
	suite.InsertChainInfoRecords()

	db := suite.Database()

	firstChain := suite.DBITS.Chains.Number(1)

	originalRowsCount := suite.CountRows2("chain_info")

	suite.Run("record is updated correctly", func() {
		updated, err := db.UpdateBeJsonRpcUrlsIfExists(firstChain.ChainId, []string{"url1", "url2"})
		suite.Require().NoError(err)
		suite.Require().True(updated)

		record := suite.DBITS.ReadChainInfoRecord(firstChain.ChainId, nil)
		suite.Equal([]string{"url1", "url2"}, record.BeJsonRpcUrls)

		suite.Equal(originalRowsCount, suite.CountRows2("chain_info"))
	})

	suite.Run("update non-existing chain should does nothing", func() {
		updated, err := db.UpdateBeJsonRpcUrlsIfExists("non-existing-chain", []string{"url1", "url2"})
		suite.Require().NoError(err)
		suite.Require().False(updated)

		suite.Equal(originalRowsCount, suite.CountRows2("chain_info"))
	})
}

//goland:noinspection SpellCheckingInspection
func (suite *IntegrationTestSuite) Test_GetBech32Config_IT() {
	db := suite.Database()

	const chainId = "cosmoshub-4"

	originalRecord := dbtypes.RecordChainInfo{
		ChainId:       chainId,
		Name:          "cosmos",
		ChainType:     "cosmos",
		Bech32:        `{"addr": "cosmos","cons": "cosmosvalcons","val": "cosmosvaloper"}`,
		Denoms:        `{"bond": "uatom"}`,
		BeJsonRpcUrls: []string{},
	}

	insertedOrUpdated, err := db.InsertOrUpdateRecordChainInfo(originalRecord)
	suite.Require().NoError(err)
	suite.Require().True(insertedOrUpdated)

	cfg, err := db.GetBech32Config(chainId)
	suite.Require().NoError(err)
	suite.Equal("cosmos", cfg.Bech32PrefixAccAddr)
	suite.Equal("cosmosvalcons", cfg.Bech32PrefixCons)
	suite.Equal("cosmosvaloper", cfg.Bech32PrefixOperator)
}

//goland:noinspection SqlNoDataSourceInspection,SqlDialectInspection
func (suite *IntegrationTestSuite) Test_IsChainPostponed_IT() {
	db := suite.Database()

	postponed, err := db.IsChainPostponed("non-existing-chain")
	suite.Require().NoError(err)
	suite.Require().False(postponed)

	firstChain := suite.DBITS.Chains.Number(1)

	originalRecord := dbtypes.RecordChainInfo{
		ChainId:       firstChain.ChainId,
		Name:          firstChain.ChainId,
		ChainType:     "cosmos",
		Bech32:        `{"a": "b"}`,
		Denoms:        `{"1": "2"}`,
		BeJsonRpcUrls: []string{},
	}

	insertedOrUpdated, err := db.InsertOrUpdateRecordChainInfo(originalRecord)
	suite.Require().NoError(err)
	suite.Require().True(insertedOrUpdated)

	postponed, err = db.IsChainPostponed(firstChain.ChainId)
	suite.Require().NoError(err)
	suite.Require().False(postponed)

	_, err = db.Sql.Exec(`UPDATE chain_info SET postponed = true WHERE chain_id = $1`, firstChain.ChainId)
	suite.Require().NoError(err)

	postponed, err = db.IsChainPostponed(firstChain.ChainId)
	suite.Require().NoError(err)
	suite.Require().True(postponed)
}
