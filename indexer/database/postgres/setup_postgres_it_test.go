package postgres

//goland:noinspection SpellCheckingInspection
import (
	"context"
	sdkmath "cosmossdk.io/math"
	"database/sql"
	"encoding/hex"
	"fmt"
	"github.com/EscanBE/go-lib/logging"
	libutils "github.com/EscanBE/go-lib/utils"
	"github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/database"
	"github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/integration_test_util"
	itutildbtypes "github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/integration_test_util/types/db"
	itutilutils "github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/integration_test_util/utils"
	sdk "github.com/cosmos/cosmos-sdk/types"
	_ "github.com/lib/pq"
	"github.com/stretchr/testify/suite"
	tmcrypto "github.com/tendermint/tendermint/crypto"
	"math"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"testing"
)

//goland:noinspection SpellCheckingInspection
type IntegrationTestSuite struct {
	suite.Suite
	DBITS *integration_test_util.DatabaseIntegrationTestSuite
}

func TestIntegrationTestSuite(t *testing.T) {
	releaser := integration_test_util.AcquireMultiTestSuitesLock(t)
	defer releaser()
	suite.Run(t, new(IntegrationTestSuite))
}

func (suite *IntegrationTestSuite) SetupSuite() {
	suite.DBITS = integration_test_util.NewDatabaseIntegrationTestSuite(suite.T(), suite.Require())
}

func (suite *IntegrationTestSuite) SetupTest() {
	suite.DBITS.TruncateAll()
}

func (suite *IntegrationTestSuite) TearDownTest() {
}

func (suite *IntegrationTestSuite) TearDownSuite() {
	suite.DBITS.CleanupSuite()
	func() {
		suite.Database().Close()
	}()
}

func (suite *IntegrationTestSuite) DB() *sql.DB {
	return suite.DBITS.Database
}

func (suite *IntegrationTestSuite) Database() *Database {
	return &Database{
		muCreatePartitionedTables: sync.Mutex{},
		Sql:                       suite.DBITS.Database,
		Logger:                    logging.NewDefaultLogger(),
	}
}

func (suite *IntegrationTestSuite) TX() (tx database.DbTransaction, commit func()) {
	dbTx, err := suite.Database().BeginDatabaseTransaction(context.Background())
	suite.Require().NoError(err, "failed to begin transaction")
	var commitCalled bool
	return dbTx, func() {
		if commitCalled {
			return
		}
		commitCalled = true
		err := dbTx.CommitTransaction()
		if err != nil {
			errMsg := err.Error()
			if strings.Contains(errMsg, "transaction has already been committed or rolled back") {
				// ignore
			} else {
				fmt.Println("ERR: failed to commit transaction", err)
			}
		}
	}
}

func (suite *IntegrationTestSuite) CountRows(tx *sql.Tx, tableName string) int {
	res, err := tx.Query("SELECT COUNT(1) FROM " + tableName)
	defer func() {
		_ = res.Close()
	}()
	suite.Require().NoErrorf(err, "failed to count table %s", tableName)
	suite.Require().Truef(res.Next(), "failed to count table %s", tableName)
	var count int
	err = res.Scan(&count)
	suite.Require().NoErrorf(err, "failed to scan row count for table %s", tableName)
	suite.Require().False(res.Next(), "expect only one record")
	return count
}

func (suite *IntegrationTestSuite) CountRows2(tableName string) int {
	res, err := suite.DB().Query("SELECT COUNT(1) FROM " + tableName)
	defer func() {
		_ = res.Close()
	}()
	suite.Require().NoErrorf(err, "failed to count table %s", tableName)
	suite.Require().Truef(res.Next(), "failed to count table %s", tableName)
	var count int
	err = res.Scan(&count)
	suite.Require().NoErrorf(err, "failed to scan row count for table %s", tableName)
	suite.Require().False(res.Next(), "expect only one record")
	return count
}

func (suite *IntegrationTestSuite) cosmosAddr(number int) string {
	return suite.DBITS.WalletAccounts.Number(number).GetCosmosAddress().String()
}

func (suite *IntegrationTestSuite) randomCosmosAddr() string {
	return integration_test_util.NewTestAccount(suite.T(), nil).GetCosmosAddress().String()
}

func (suite *IntegrationTestSuite) ethAddr(number int) string {
	return strings.ToLower(suite.DBITS.WalletAccounts.Number(number).GetEthAddress().String())
}

func (suite *IntegrationTestSuite) randomEthAddr() string {
	return integration_test_util.NewTestAccount(suite.T(), nil).GetEthAddress().String()
}

func (suite *IntegrationTestSuite) randomBytes(bytes int) []byte {
	return tmcrypto.CRandBytes(bytes)
}

func (suite *IntegrationTestSuite) randomInterchainAccountCosmosAddress() string {
	return sdk.AccAddress(hex.EncodeToString(suite.randomBytes(32))).String()
}

func (suite *IntegrationTestSuite) randomInterchainAccountBytesAddress() string {
	return strings.ToLower("0x" + hex.EncodeToString(suite.randomBytes(32)))
}

func (suite *IntegrationTestSuite) readCountResult(rows *sql.Rows, err error) int {
	suite.Require().NoError(err)
	defer func() {
		_ = rows.Close()
	}()
	suite.Require().True(rows.Next(), "expected result")
	var count int
	err = rows.Scan(&count)
	suite.Require().NoError(err, "failed to scan count")
	suite.Require().False(rows.Next(), "expect only one record")
	return count
}

func (suite *IntegrationTestSuite) readTransactionRecord(hash string, height int64, chainId string, optionalTx *sql.Tx) itutildbtypes.TransactionRecord {
	if len(chainId) == 0 {
		chainId = suite.DBITS.Chains.Number(1).ChainId
	}
	return suite.DBITS.ReadTransactionRecord(hash, height, chainId, optionalTx)
}

func (suite *IntegrationTestSuite) NewBaseCoin(amount int64, chainId string) sdk.Coin {
	if len(chainId) == 0 {
		chainId = suite.DBITS.Chains.Number(1).ChainId
	}
	for _, chain := range suite.DBITS.Chains {
		if chain.ChainId == chainId {
			intAmt := sdkmath.NewInt(amount).Mul(sdkmath.NewInt(int64(math.Pow10(int(chain.Decimals)))))
			return sdk.NewCoin(chain.MinDenom, intAmt)
		}
	}

	panic(chainId)
}

func (suite *IntegrationTestSuite) NewBaseCoinWithLow(amountH, amountL int64, chainId string) sdk.Coin {
	if len(chainId) == 0 {
		chainId = suite.DBITS.Chains.Number(1).ChainId
	}
	for _, chain := range suite.DBITS.Chains {
		if chain.ChainId == chainId {
			intAmt := sdkmath.NewInt(amountH).Mul(sdkmath.NewInt(int64(math.Pow10(int(chain.Decimals)))))
			intAmt = intAmt.Add(sdkmath.NewInt(amountL))
			sdk.NewCoin(chain.MinDenom, intAmt)
		}
	}

	panic(chainId)
}

//goland:noinspection SqlDialectInspection,SqlNoDataSourceInspection
func (suite *IntegrationTestSuite) GetHighestPartitionAvailable() int64 {
	rows, err := suite.DB().Query(`SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'transaction_%'`)
	suite.Require().NoError(err)
	defer func() {
		_ = rows.Close()
	}()
	var highest int64
	for rows.Next() {
		var tableName string
		err = rows.Scan(&tableName)
		suite.Require().NoError(err)

		if !regexp.MustCompile("transaction_\\d+").MatchString(tableName) {
			continue
		}

		partition, err := strconv.ParseInt(strings.Split(tableName, "_")[1], 10, 64)
		suite.Require().NoError(err)
		highest = libutils.MaxInt64(highest, partition)
	}

	return highest
}

func randomPositiveInt64() int64 {
	return itutilutils.RandomPositiveInt64()
}

func randomHeight() int64 {
	return itutilutils.RandomBlockHeight()
}

func genRandomBytes(size int) []byte {
	return itutilutils.GenRandomBytes(size)
}

func strPtrOrNil(v string) *string {
	if v == "" {
		return nil
	}
	return &v
}

func int32PtrOrNil(v int32) *int32 {
	if v == 0 {
		return nil
	}
	return &v
}

func boolPtrOrNil(v bool) *bool {
	if v == false {
		return nil
	}
	return &v
}
