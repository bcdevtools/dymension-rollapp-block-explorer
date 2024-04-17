package postgres

import (
	"fmt"
	dbtypes "github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/database/types"
	"time"
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
		ChainId:   firstChain.ChainId,
		Name:      firstChain.ChainId,
		ChainType: "cosmos",
		Bech32:    `{"a": "b"}`,
		Denoms:    `{"1": "2"}`,
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

	_, err = db.Sql.Exec(`UPDATE chain_info SET postponed = false, expiry_at_epoch = $1 WHERE chain_id = $2`, time.Now().UTC().Unix()-1, firstChain.ChainId)
	suite.Require().NoError(err)

	postponed, err = db.IsChainPostponed(firstChain.ChainId)
	suite.Require().NoError(err)
	suite.Require().True(postponed, "postponed state must be effective due to value of expiry_at_epoch")
}

//goland:noinspection SqlNoDataSourceInspection,SqlDialectInspection,SpellCheckingInspection
func (suite *IntegrationTestSuite) Test_SqlFunc_get_indexing_fallbehind_chains_IT() {
	db := suite.Database()

	const postponedChain1 = "postponed-chain-1"
	const outdatedChain1 = "outdated-chain-1"
	const goodChain1 = "good-chain-1"
	const postponedChain2 = "postponed-chain-2"
	const outdatedChain2 = "outdated-chain-2"
	const goodChain2 = "good-chain-2"
	const almostOutdatedChain = "almost-outdated-chain"

	for _, chainId := range []string{
		postponedChain1, postponedChain2, outdatedChain1, outdatedChain2, almostOutdatedChain, goodChain1, goodChain2,
	} {
		originalRecord := dbtypes.RecordChainInfo{
			ChainId:   chainId,
			Name:      chainId,
			ChainType: "cosmos",
			Bech32:    `{"a": "b"}`,
			Denoms:    `{"1": "2"}`,
		}

		insertedOrUpdated, err := db.InsertOrUpdateRecordChainInfo(originalRecord)
		suite.Require().NoError(err)
		suite.Require().True(insertedOrUpdated)
	}

	const assumeCurrentBlockHeight = 1000
	const outdatedThresholdSeconds = 100
	var now = time.Now().UTC().Unix()

	updateLastIndex := func(chainId string, height, epoch int64) {
		_, err := db.Sql.Exec(
			`UPDATE chain_info SET latest_indexed_block = $1, increased_latest_indexed_block_at = $2 WHERE chain_id = $3`,
			height,
			epoch,
			chainId,
		)
		suite.Require().NoError(err)
	}

	_, err := db.Sql.Exec(
		`UPDATE chain_info SET postponed = true WHERE chain_id IN ($1, $2)`,
		postponedChain1,
		postponedChain2,
	)
	suite.Require().NoError(err)

	updateLastIndex(postponedChain1, assumeCurrentBlockHeight/2, now-86400*30)
	updateLastIndex(postponedChain2, assumeCurrentBlockHeight, now) // recently postponed chain

	var outdatedChain1Height int64 = assumeCurrentBlockHeight / 2
	var outdatedChain2Height int64 = assumeCurrentBlockHeight
	updateLastIndex(outdatedChain1, outdatedChain1Height, now-outdatedThresholdSeconds*2)
	updateLastIndex(outdatedChain2, outdatedChain2Height, now-outdatedThresholdSeconds-1)

	var almostOutdatedChainEpochShifting int64 = outdatedThresholdSeconds - 5
	updateLastIndex(almostOutdatedChain, assumeCurrentBlockHeight-5, now-almostOutdatedChainEpochShifting)

	updateLastIndex(goodChain1, assumeCurrentBlockHeight-10, now-1)
	updateLastIndex(goodChain2, assumeCurrentBlockHeight, now)

	var chainId string
	var height, epoch, epochDiff int64

	rows, err := db.Sql.Query(
		`SELECT * FROM get_indexing_fallbehind_chains($1)`,
		outdatedThresholdSeconds,
	)
	suite.Require().NoError(err)

	suite.Require().True(rows.Next())
	err = rows.Scan(&chainId, &height, &epoch, &epochDiff)
	suite.Require().NoError(err)
	suite.Equal(outdatedChain1, chainId)
	suite.Equal(outdatedChain1Height, height)

	suite.Require().True(rows.Next())
	err = rows.Scan(&chainId, &height, &epoch, &epochDiff)
	suite.Require().NoError(err)
	suite.Equal(outdatedChain2, chainId)
	suite.Equal(outdatedChain2Height, height)

	suite.Require().False(rows.Next())

	rows, err = db.Sql.Query(
		`SELECT * FROM get_indexing_fallbehind_chains($1)`,
		almostOutdatedChainEpochShifting-1,
	)
	suite.Require().NoError(err)
	suite.Require().True(rows.Next())
	suite.Require().True(rows.Next())
	suite.Require().True(rows.Next())
	err = rows.Scan(&chainId, &height, &epoch, &epochDiff)
	suite.Require().NoError(err)
	suite.Equal(almostOutdatedChain, chainId)
	suite.Require().False(rows.Next())
}
