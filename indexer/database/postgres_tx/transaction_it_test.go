package pg_db_tx

import (
	dbtypes "github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/database/types"
	"time"
)

func (suite *IntegrationTestSuite) Test_InsertRecordTransactionsIfNotExists_IT() {
	suite.InsertChainInfoRecords()

	tx, _ := suite.TX()

	originalRowsCount := suite.CountRows(tx.Tx, "transaction")

	firstChain := suite.DBITS.Chains.Number(1)

	height := randomPositiveInt64()

	//goland:noinspection SpellCheckingInspection
	originalRecord1 := dbtypes.NewRecordTransactionForInsert(
		firstChain.ChainId,
		height,
		"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
		time.Now().UTC().Unix(),
		[]string{"type-1"},
		"cosmos",
	)

	//goland:noinspection SpellCheckingInspection
	originalRecord2 := dbtypes.NewRecordTransactionForInsert(
		firstChain.ChainId,
		height,
		"0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
		time.Now().UTC().Unix(),
		[]string{"type-2", "type-3"},
		"evm",
	)

	err := tx.InsertRecordTransactionsIfNotExists(dbtypes.RecordsTransaction{originalRecord1, originalRecord2})
	suite.Require().NoError(err)

	suite.Run("record is inserted correctly", func() {
		record1 := suite.DBITS.ReadTransactionRecord(originalRecord1.Hash, originalRecord1.Height, originalRecord1.ChainId, tx.Tx)
		suite.Equal(originalRecord1.ChainId, record1.ChainId)
		suite.Equal(originalRecord1.Height, record1.Height)
		suite.Equal(originalRecord1.Hash, record1.Hash)
		suite.Equal(originalRecord1.PartitionId, record1.PartitionId)
		suite.Equal(originalRecord1.Epoch, record1.Epoch)
		suite.Equal(originalRecord1.MessageTypes, record1.MessageTypes)
		suite.Equal(originalRecord1.TxType, record1.TxType)

		record2 := suite.DBITS.ReadTransactionRecord(originalRecord2.Hash, originalRecord2.Height, originalRecord2.ChainId, tx.Tx)
		suite.Equal(originalRecord2.ChainId, record2.ChainId)
		suite.Equal(originalRecord2.Height, record2.Height)
		suite.Equal(originalRecord2.Hash, record2.Hash)
		suite.Equal(originalRecord2.PartitionId, record2.PartitionId)
		suite.Equal(originalRecord2.Epoch, record2.Epoch)
		suite.Equal(originalRecord2.MessageTypes, record2.MessageTypes)
		suite.Equal(originalRecord2.TxType, record2.TxType)

		suite.Equal(originalRowsCount+2, suite.CountRows(tx.Tx, "transaction"))
		originalRowsCount += 2
	})

	suite.Run("duplicated insert should not update", func() {
		alteredRecord1 := originalRecord1
		alteredRecord1.MessageTypes = append(alteredRecord1.MessageTypes, "type-new")

		record1 := suite.DBITS.ReadTransactionRecord(originalRecord1.Hash, originalRecord1.Height, originalRecord1.ChainId, tx.Tx)
		suite.Equal(originalRecord1.ChainId, record1.ChainId)
		suite.Equal(originalRecord1.Height, record1.Height)
		suite.Equal(originalRecord1.Hash, record1.Hash)
		suite.Equal(originalRecord1.PartitionId, record1.PartitionId)
		suite.Equal(originalRecord1.Epoch, record1.Epoch)
		suite.Equal(originalRecord1.MessageTypes, record1.MessageTypes)
		suite.Equal(originalRecord1.TxType, record1.TxType)

		suite.Equal(originalRowsCount, suite.CountRows(tx.Tx, "transaction"))
	})
}