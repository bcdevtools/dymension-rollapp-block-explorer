package pg_db_tx

import (
	"database/sql"
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

		err := tx.InsertRecordsRecentAccountTransactionIfNotExists(dbtypes.RecordsRecentAccountTransaction{alteredRecord1})
		suite.Require().NoError(err)

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

//goland:noinspection SqlDialectInspection,SqlNoDataSourceInspection
func (suite *IntegrationTestSuite) Test_InsertRecordsRefAccountToRecentTxIfNotExists_IT() {
	suite.InsertChainInfoRecords()

	firstChain := suite.DBITS.Chains.Number(1)

	height := randomPositiveInt64()

	account1 := dbtypes.RecordAccount{
		ChainId:                 firstChain.ChainId,
		Bech32Address:           suite.DBITS.WalletAccounts.Number(1).GetCosmosAddress().String(),
		BalanceOnErc20Contracts: []string{"a", "b"},
		BalanceOnNftContracts:   []string{"c", "d"},
	}

	account2 := dbtypes.RecordAccount{
		ChainId:                 firstChain.ChainId,
		Bech32Address:           suite.DBITS.WalletAccounts.Number(2).GetCosmosAddress().String(),
		BalanceOnErc20Contracts: []string{"e", "f"},
		BalanceOnNftContracts:   []string{"c", "d"},
	}

	//goland:noinspection SpellCheckingInspection
	recentTx1 := dbtypes.NewRecordRecentAccountTransactionForInsert(
		firstChain.ChainId,
		height,
		"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
		time.Now().UTC().Unix(),
		[]string{"type-1"},
	)

	//goland:noinspection SpellCheckingInspection
	recentTx2 := dbtypes.NewRecordRecentAccountTransactionForInsert(
		firstChain.ChainId,
		height,
		"0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
		time.Now().UTC().Unix(),
		[]string{"type-2", "type-3"},
	)

	//goland:noinspection SpellCheckingInspection
	recentTx3 := dbtypes.NewRecordRecentAccountTransactionForInsert(
		firstChain.ChainId,
		height,
		"BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
		time.Now().UTC().Unix(),
		[]string{"type-4", "type-5", "type-6"},
	)

	tx, commit := suite.TX()

	originalRefRecord1 := dbtypes.NewRecordRefAccountToRecentTxForInsert(
		firstChain.ChainId,
		account1.Bech32Address,
		height,
		recentTx1.Hash,
	)
	originalRefRecord1.Signer = true
	originalRefRecord1.Erc20 = true

	originalRefRecord2 := dbtypes.NewRecordRefAccountToRecentTxForInsert(
		firstChain.ChainId,
		account1.Bech32Address,
		height,
		recentTx2.Hash,
	)

	originalRefRecord3 := dbtypes.NewRecordRefAccountToRecentTxForInsert(
		firstChain.ChainId,
		account2.Bech32Address,
		height,
		recentTx2.Hash,
	)

	var err error

	err = tx.InsertOrUpdateRecordsAccount(
		dbtypes.RecordsAccount{
			account1,
			account2,
		},
	)
	suite.Require().NoError(err)
	suite.Require().Equal(2, suite.CountRows(tx.Tx, "account"))

	err = tx.InsertRecordsRecentAccountTransactionIfNotExists(
		dbtypes.RecordsRecentAccountTransaction{
			recentTx1,
			recentTx2,
			recentTx3,
		},
	)
	suite.Require().NoError(err)
	suite.Require().Equal(3, suite.CountRows(tx.Tx, "recent_account_transaction"))

	err = tx.InsertRecordsRefAccountToRecentTxIfNotExists(
		dbtypes.RecordsRefAccountToRecentTx{
			originalRefRecord1,
			originalRefRecord2,
			originalRefRecord3,
		},
	)
	suite.Require().NoError(err)
	suite.Require().Equal(3, suite.CountRows(tx.Tx, "ref_account_to_recent_tx"))

	suite.Run("record is inserted correctly", func() {
		record1 := suite.DBITS.ReadRefAccountToRecentTxRecord(originalRefRecord1.Bech32Address, originalRefRecord1.Hash, originalRefRecord1.Height, originalRefRecord1.ChainId, tx.Tx)
		suite.Equal(originalRefRecord1.ChainId, record1.ChainId)
		suite.Equal(originalRefRecord1.Bech32Address, record1.Bech32Address)
		suite.Equal(originalRefRecord1.Height, record1.Height)
		suite.Equal(originalRefRecord1.Hash, record1.Hash)
		suite.Equal(sql.NullBool{Bool: true, Valid: true}, record1.Signer)
		suite.Equal(sql.NullBool{Bool: true, Valid: true}, record1.Erc20)
		suite.Equal(sql.NullBool{Bool: false, Valid: false}, record1.NFT)

		record2 := suite.DBITS.ReadRefAccountToRecentTxRecord(originalRefRecord2.Bech32Address, originalRefRecord2.Hash, originalRefRecord2.Height, originalRefRecord2.ChainId, tx.Tx)
		suite.Equal(originalRefRecord2.ChainId, record2.ChainId)
		suite.Equal(originalRefRecord2.Bech32Address, record2.Bech32Address)
		suite.Equal(originalRefRecord2.Height, record2.Height)
		suite.Equal(originalRefRecord2.Hash, record2.Hash)
		suite.Equal(sql.NullBool{Bool: false, Valid: false}, record2.Signer)
		suite.Equal(sql.NullBool{Bool: false, Valid: false}, record2.Erc20)
		suite.Equal(sql.NullBool{Bool: false, Valid: false}, record2.NFT)

		record3 := suite.DBITS.ReadRefAccountToRecentTxRecord(originalRefRecord3.Bech32Address, originalRefRecord3.Hash, originalRefRecord3.Height, originalRefRecord3.ChainId, tx.Tx)
		suite.Equal(originalRefRecord3.ChainId, record3.ChainId)
		suite.Equal(originalRefRecord3.Bech32Address, record3.Bech32Address)
		suite.Equal(originalRefRecord3.Height, record3.Height)
		suite.Equal(originalRefRecord3.Hash, record3.Hash)
		suite.Equal(sql.NullBool{Bool: false, Valid: false}, record3.Signer)
		suite.Equal(sql.NullBool{Bool: false, Valid: false}, record3.Erc20)
		suite.Equal(sql.NullBool{Bool: false, Valid: false}, record3.NFT)

		suite.Equal(3, suite.CountRows(tx.Tx, "ref_account_to_recent_tx"))
	})

	suite.Run("duplicated insert should not update", func() {
		alteredRecord1 := originalRefRecord1
		alteredRecord1.Signer = !alteredRecord1.Signer
		alteredRecord1.Erc20 = !alteredRecord1.Erc20
		alteredRecord1.NFT = !alteredRecord1.NFT

		err := tx.InsertRecordsRefAccountToRecentTxIfNotExists(dbtypes.RecordsRefAccountToRecentTx{alteredRecord1})
		suite.Require().NoError(err)

		record1 := suite.DBITS.ReadRefAccountToRecentTxRecord(originalRefRecord1.Bech32Address, originalRefRecord1.Hash, originalRefRecord1.Height, originalRefRecord1.ChainId, tx.Tx)
		suite.Equal(originalRefRecord1.ChainId, record1.ChainId)
		suite.Equal(originalRefRecord1.Bech32Address, record1.Bech32Address)
		suite.Equal(originalRefRecord1.Height, record1.Height)
		suite.Equal(originalRefRecord1.Hash, record1.Hash)
		suite.Equal(sql.NullBool{Bool: true, Valid: true}, record1.Signer)
		suite.Equal(sql.NullBool{Bool: true, Valid: true}, record1.Erc20)
		suite.Equal(sql.NullBool{Bool: false, Valid: false}, record1.NFT)

		suite.Equal(3, suite.CountRows(tx.Tx, "ref_account_to_recent_tx"))
	})

	// call prune function
	err = tx.CleanupZeroRefCountRecentAccountTransaction()
	suite.Require().NoError(err)

	commit()

	suite.Equal(2, suite.CountRows2("recent_account_transaction"), "two recent txs with reference should be kept")
	suite.Zero(suite.CountRows2("reduced_ref_count_recent_account_transaction"))
}
