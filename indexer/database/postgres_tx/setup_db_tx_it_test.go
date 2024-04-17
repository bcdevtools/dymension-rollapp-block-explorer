package pg_db_tx

//goland:noinspection SpellCheckingInspection
import (
	"context"
	sdkmath "cosmossdk.io/math"
	"database/sql"
	"fmt"
	"github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/database/types"
	"github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/integration_test_util"
	itutilutils "github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/integration_test_util/utils"
	sdk "github.com/cosmos/cosmos-sdk/types"
	_ "github.com/lib/pq"
	"github.com/stretchr/testify/suite"
	"math"
	"strings"
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
}

func (suite *IntegrationTestSuite) DB() *sql.DB {
	return suite.DBITS.Database
}

func (suite *IntegrationTestSuite) TX() (tx *dbTxImpl, commit func()) {
	dbTx, err := suite.DB().Begin()
	suite.Require().NoError(err, "failed to begin transaction")
	var commitCalled bool
	return BeginDatabaseTransaction(context.Background(), dbTx), func() {
		if commitCalled {
			return
		}
		commitCalled = true
		err := dbTx.Commit()
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

func (suite *IntegrationTestSuite) InsertChainInfoRecords() {
	tx, commit := suite.TX()
	defer func() {
		commit()
	}()
	for _, chain := range suite.DBITS.Chains {
		originalRecord := types.RecordChainInfo{
			ChainId:            chain.ChainId,
			Name:               chain.ChainId,
			ChainType:          "cosmos",
			Bech32:             fmt.Sprintf(`{"addr": "%s"}`, chain.Bech32AccAddrPrefix),
			Denoms:             fmt.Sprintf(`{"bond": "%s"}`, chain.MinDenom),
			BeJsonRpcUrls:      nil,
			LatestIndexedBlock: 0,
		}

		//goland:noinspection SpellCheckingInspection,SqlDialectInspection,SqlNoDataSourceInspection
		res, err := tx.Tx.Exec(`
INSERT INTO chain_info (chain_id, "name", chain_type, bech32, denoms) VALUES ($1, $2, $3, $4, $5)`,
			originalRecord.ChainId,   // 1
			originalRecord.Name,      // 2
			originalRecord.ChainType, // 3
			originalRecord.Bech32,    // 4
			originalRecord.Denoms,    // 5
		)
		suite.Require().NoError(err)
		effected, err := res.RowsAffected()
		suite.Require().NoError(err)
		suite.Require().True(effected > 0)
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

func randomPositiveInt64() int64 {
	return itutilutils.RandomPositiveInt64()
}
