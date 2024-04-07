package pg_db_tx

import (
	dbtypes "github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/database/types"
	"time"
)

//goland:noinspection SqlDialectInspection,SqlNoDataSourceInspection
func (suite *IntegrationTestSuite) Test_InsertRecordsRecentAccountTransactionIfNotExists_IT() {
	suite.InsertChainInfoRecords()

	originalRowsCount := suite.CountRows2("recent_account_transaction")
	suite.Require().Zero(originalRowsCount)
	suite.Require().Zero(suite.CountRows2("reduced_ref_count_recent_account_transaction"))

	firstChain := suite.DBITS.Chains.Number(1)

	height := randomPositiveInt64()

	//goland:noinspection SpellCheckingInspection
	originalRecord1 := dbtypes.NewRecordRecentAccountTransactionForInsert(
		firstChain.ChainId,
		height,
		"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
		time.Now().UTC().Unix(),
		[]string{"type-1"},
	)

	//goland:noinspection SpellCheckingInspection
	originalRecord2 := dbtypes.NewRecordRecentAccountTransactionForInsert(
		firstChain.ChainId,
		height,
		"0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
		time.Now().UTC().Unix(),
		[]string{"type-2", "type-3"},
	)

	tx, commit := suite.TX()

	err := tx.InsertRecordsRecentAccountTransactionIfNotExists(dbtypes.RecordsRecentAccountTransaction{originalRecord1, originalRecord2})
	suite.Require().NoError(err)

	suite.Run("record is inserted correctly", func() {
		record1 := suite.DBITS.ReadRecentAccountTransactionRecord(originalRecord1.Hash, originalRecord1.Height, originalRecord1.ChainId, tx.Tx)
		suite.Equal(originalRecord1.ChainId, record1.ChainId)
		suite.Equal(originalRecord1.Height, record1.Height)
		suite.Equal(originalRecord1.Hash, record1.Hash)
		suite.Equal(int16(0), record1.RefCount)
		suite.Equal(originalRecord1.Epoch, record1.Epoch)
		suite.Equal(originalRecord1.MessageTypes, record1.MessageTypes)

		record2 := suite.DBITS.ReadRecentAccountTransactionRecord(originalRecord2.Hash, originalRecord2.Height, originalRecord2.ChainId, tx.Tx)
		suite.Equal(originalRecord2.ChainId, record2.ChainId)
		suite.Equal(originalRecord2.Height, record2.Height)
		suite.Equal(originalRecord2.Hash, record2.Hash)
		suite.Equal(int16(0), record2.RefCount)
		suite.Equal(originalRecord2.Epoch, record2.Epoch)
		suite.Equal(originalRecord2.MessageTypes, record2.MessageTypes)

		suite.Equal(originalRowsCount+2, suite.CountRows(tx.Tx, "recent_account_transaction"))
		suite.Equal(2, suite.CountRows(tx.Tx, "reduced_ref_count_recent_account_transaction"), "inserted record should be inserted into reduced_ref_count_recent_account_transaction via trigger")
	})

	suite.Run("duplicated insert should not update", func() {
		alteredRecord1 := originalRecord1
		alteredRecord1.MessageTypes = append(alteredRecord1.MessageTypes, "type-new")

		record1 := suite.DBITS.ReadRecentAccountTransactionRecord(originalRecord1.Hash, originalRecord1.Height, originalRecord1.ChainId, tx.Tx)
		suite.Equal(originalRecord1.ChainId, record1.ChainId)
		suite.Equal(originalRecord1.Height, record1.Height)
		suite.Equal(originalRecord1.Hash, record1.Hash)
		suite.Equal(int16(0), record1.RefCount)
		suite.Equal(originalRecord1.Epoch, record1.Epoch)
		suite.Equal(originalRecord1.MessageTypes, record1.MessageTypes)

		suite.Equal(originalRowsCount+2, suite.CountRows(tx.Tx, "recent_account_transaction"))
		suite.Equal(2, suite.CountRows(tx.Tx, "reduced_ref_count_recent_account_transaction"))
	})

	// call prune function
	err = tx.CleanupZeroRefCountRecentAccountTransaction()
	suite.Require().NoError(err)

	commit()

	suite.Equal(originalRowsCount, suite.CountRows2("recent_account_transaction"), "no recent acc tx should be inserted because no ref count")
	suite.Zero(suite.CountRows2("reduced_ref_count_recent_account_transaction"))

	suite.Run("record with ref count should be kept", func() {
		tx, commit := suite.TX()

		err := tx.InsertRecordsRecentAccountTransactionIfNotExists(dbtypes.RecordsRecentAccountTransaction{originalRecord1, originalRecord2})
		suite.Require().NoError(err)

		suite.Equal(originalRowsCount+2, suite.CountRows(tx.Tx, "recent_account_transaction"))
		suite.Equal(2, suite.CountRows(tx.Tx, "reduced_ref_count_recent_account_transaction"))

		_, err = tx.Tx.Exec(
			"UPDATE recent_account_transaction SET ref_count = 1 WHERE hash = $1 AND height = $2 AND chain_id = $3",
			originalRecord1.Hash, originalRecord1.Height, originalRecord1.ChainId,
		)
		suite.Require().NoError(err)

		// call prune function
		err = tx.CleanupZeroRefCountRecentAccountTransaction()
		suite.Require().NoError(err)

		commit()

		suite.Equal(originalRowsCount+1, suite.CountRows2("recent_account_transaction"), "only one record with ref count should be kept")
		suite.Zero(suite.CountRows2("reduced_ref_count_recent_account_transaction"), "all records should be pruned")

		record1 := suite.DBITS.ReadRecentAccountTransactionRecord(originalRecord1.Hash, originalRecord1.Height, originalRecord1.ChainId, nil)
		suite.Equal(originalRecord1.ChainId, record1.ChainId)
		suite.Equal(originalRecord1.Height, record1.Height)
		suite.Equal(originalRecord1.Hash, record1.Hash)
		suite.Equal(int16(1), record1.RefCount)
		suite.Equal(originalRecord1.Epoch, record1.Epoch)
		suite.Equal(originalRecord1.MessageTypes, record1.MessageTypes)
	})
}
