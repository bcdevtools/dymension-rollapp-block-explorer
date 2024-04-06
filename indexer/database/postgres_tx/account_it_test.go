package pg_db_tx

import (
	dbtypes "github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/database/types"
	"sort"
)

func (suite *IntegrationTestSuite) TestDatabase_AddNewAccountsIfNotExists_IT() {
	suite.InsertChainInfoRecords()

	tx, _ := suite.TX()

	originalRowsCount := suite.CountRows2("account")

	firstChain := suite.DBITS.Chains.Number(1)

	originalRecord1 := dbtypes.RecordAccount{
		ChainId:                 firstChain.ChainId,
		Bech32Address:           suite.DBITS.WalletAccounts.Number(1).GetCosmosAddress().String(),
		BalanceOnErc20Contracts: []string{"a", "b"},
		BalanceOnNftContracts:   []string{"c", "d"},
	}

	originalRecord2 := dbtypes.RecordAccount{
		ChainId:                 firstChain.ChainId,
		Bech32Address:           suite.DBITS.WalletAccounts.Number(2).GetCosmosAddress().String(),
		BalanceOnErc20Contracts: []string{"e", "f"},
		BalanceOnNftContracts:   []string{"c", "d"},
	}

	err := tx.InsertOrUpdateRecordsAccount([]dbtypes.RecordAccount{originalRecord1, originalRecord2})
	suite.Require().NoError(err)

	suite.Run("record is inserted correctly", func() {
		record1 := suite.DBITS.ReadAccountRecord(originalRecord1.ChainId, originalRecord1.Bech32Address, tx.Tx)
		suite.Equal(originalRecord1.ChainId, record1.ChainId)
		suite.Equal(originalRecord1.Bech32Address, record1.Bech32Address)
		suite.Equal(int16(0), record1.ContinousInsertReferenceCurrentTxCounter, "should not update the ref counter")
		suite.Equal(originalRecord1.BalanceOnErc20Contracts, record1.BalanceOnErc20Contracts)
		suite.Equal(originalRecord1.BalanceOnNftContracts, record1.BalanceOnNftContracts)

		record2 := suite.DBITS.ReadAccountRecord(originalRecord2.ChainId, originalRecord2.Bech32Address, tx.Tx)
		suite.Equal(originalRecord2.ChainId, record2.ChainId)
		suite.Equal(originalRecord2.Bech32Address, record2.Bech32Address)
		suite.Equal(int16(0), record2.ContinousInsertReferenceCurrentTxCounter, "should not update the ref counter")
		suite.Equal(originalRecord2.BalanceOnErc20Contracts, record2.BalanceOnErc20Contracts)
		suite.Equal(originalRecord2.BalanceOnNftContracts, record2.BalanceOnNftContracts)

		suite.Equal(originalRowsCount+2, suite.CountRows2("chain_info"))
		originalRowsCount += 2
	})

	suite.Run("inserting the same record again should update", func() {
		//goland:noinspection SpellCheckingInspection,SqlDialectInspection,SqlNoDataSourceInspection
		_, err = tx.Tx.Exec(
			`
			UPDATE account SET continous_insert_ref_cur_tx_counter = 99 
			WHERE chain_id = $1 AND bech32_address = $2`,
			originalRecord1.ChainId,
			originalRecord1.Bech32Address,
		)
		suite.Require().NoError(err)

		newRecord1 := dbtypes.RecordAccount{
			ChainId:                 originalRecord1.ChainId,
			Bech32Address:           originalRecord1.Bech32Address,
			BalanceOnErc20Contracts: []string{"e", "f"},
			BalanceOnNftContracts:   append([]string{"e", "f", "g"}, originalRecord1.BalanceOnNftContracts[0]),
		}
		newRecord1.BalanceOnErc20Contracts = append(newRecord1.BalanceOnErc20Contracts, newRecord1.BalanceOnErc20Contracts...)
		newRecord1.BalanceOnNftContracts = append(newRecord1.BalanceOnNftContracts, newRecord1.BalanceOnNftContracts...)

		err = tx.InsertOrUpdateRecordsAccount([]dbtypes.RecordAccount{newRecord1})
		suite.Require().NoError(err)

		record := suite.DBITS.ReadAccountRecord(newRecord1.ChainId, newRecord1.Bech32Address, tx.Tx)
		suite.Equal(originalRecord1.ChainId, record.ChainId)
		suite.Equal(originalRecord1.Bech32Address, record.Bech32Address)
		suite.Equal(int16(99), record.ContinousInsertReferenceCurrentTxCounter, "ref should be kept")
		sort.Strings(record.BalanceOnErc20Contracts)
		suite.Equal(
			[]string{"a", "b", "e", "f"},
			record.BalanceOnErc20Contracts,
			"contracts address should be distinct merged",
		)
		sort.Strings(record.BalanceOnNftContracts)
		suite.Equal(
			[]string{"c", "d", "e", "f", "g"},
			record.BalanceOnNftContracts,
			"contracts address should be distinct merged",
		)

		suite.Equal(originalRowsCount, suite.CountRows2("chain_info"))
	})
}
