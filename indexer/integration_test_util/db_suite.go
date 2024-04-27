package integration_test_util

//goland:noinspection SpellCheckingInspection
import (
	"database/sql"
	"fmt"
	"github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/constants"
	itutiltypes "github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/integration_test_util/types"
	"github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/utils"
	"github.com/stretchr/testify/require"
	"net"
	"os"
	"os/exec"
	"path"
	"strings"
	"sync"
	"testing"
	"time"
)

const (
	containerName    = constants.IT_PG_DOCKER_CONTAINER
	databasePort     = constants.IT_PG_PORT
	containerVersion = constants.IT_DB_PG_VERSION

	databaseName     = constants.IT_PG_SHARED_IDENTITY
	databaseOwner    = constants.IT_PG_SHARED_IDENTITY
	databasePassword = constants.IT_PG_PASS
)

// DatabaseIntegrationTestSuite is a helper for Database integration test.
type DatabaseIntegrationTestSuite struct {
	t       *testing.T
	require *require.Assertions
	muTest  sync.RWMutex

	databaseContainerName string
	databasePort          uint16
	databaseName          string
	databaseUser          string
	databasePassword      string

	Database *sql.DB

	Chains            itutiltypes.TestChains
	ValidatorAccounts itutiltypes.TestAccounts
	WalletAccounts    itutiltypes.TestAccounts
}

// NewDatabaseIntegrationTestSuite creates a new database integration test suite with default configuration
//
//goland:noinspection SqlDialectInspection,SqlNoDataSourceInspection
func NewDatabaseIntegrationTestSuite(
	t *testing.T, r *require.Assertions,
) *DatabaseIntegrationTestSuite {
	ensureTestEnv(databaseName, databaseOwner, databasePort)

	if r == nil {
		r = require.New(t)
	}

	// check required binary
	var err error
	_, err = exec.LookPath("docker")
	require.NoError(t, err, "docker must be installed because database will be run as docker container")
	_, err = exec.LookPath("psql")
	require.NoError(t, err, "postgresql client must be installed because it will be used to create database")

	// setup database container
	isContainerStopped, _ := isPgClosed()

	if isContainerStopped { // remake database
		fmt.Println("Remove existing database container")
		_ = shutdownPg()
		time.Sleep(500 * time.Millisecond)

		require.NoError(t, launchPostgresAsDocker())

		for {
			closed, _ := isPgClosed()
			if closed {
				time.Sleep(100 * time.Millisecond)
				continue
			}
			break
		}
		time.Sleep(5 * time.Second)
	} else {
		time.Sleep(300 * time.Millisecond)
	}

	pgDbSuperUser := openDbConnection(t, "postgres", "postgres")
	defer func() {
		_ = pgDbSuperUser.Close()
	}()

	// check if database is exists
	rows := pgDbSuperUser.QueryRow("SELECT COUNT(1) FROM pg_database WHERE datname = $1", databaseName)
	var count int
	err = rows.Scan(&count)
	require.NoError(t, err)

	remakeDb := count != 1

	if remakeDb {
		require.NoError(
			t,
			runPsql("postgres", "postgres", "-c", fmt.Sprintf("CREATE DATABASE %s;", databaseName)),
		)
		require.NoError(
			t,
			runPsql("postgres", "postgres", "-c", fmt.Sprintf("CREATE ROLE %s WITH ENCRYPTED PASSWORD '%s';", databaseOwner, databasePassword)),
		)
		require.NoError(
			t,
			runPsql("postgres", "postgres", "-c", fmt.Sprintf("ALTER ROLE %s WITH LOGIN;", databaseOwner)),
		)
		require.NoError(
			t,
			runPsql("postgres", "postgres", "-c", fmt.Sprintf("GRANT ALL PRIVILEGES ON DATABASE %s TO %s;", databaseName, databaseOwner)),
		)
		require.NoError(
			t,
			runPsql("postgres", "postgres", "-c", fmt.Sprintf("ALTER DATABASE %s OWNER TO %s;", databaseName, databaseOwner)),
		)

		const schemaDir = "../schema"

		filePathSchemaSql := path.Join(schemaDir, "schema.sql")
		_, err = os.Stat(filePathSchemaSql)
		require.NoError(t, err)
		err = runPsql(databaseName, databaseOwner, "-f", filePathSchemaSql)
		require.NoError(t, err)

		filePathSuperSchemaSql := path.Join(schemaDir, "super-schema.sql")
		_, err = os.Stat(filePathSuperSchemaSql)
		require.NoError(t, err)
		err = runPsql(databaseName, "postgres", "-f", filePathSuperSchemaSql)
		require.NoError(t, err)
	}

	// Initialize connection
	pgDbByOwner := openDbConnection(t, databaseName, databaseOwner)

	//goland:noinspection SpellCheckingInspection
	result := &DatabaseIntegrationTestSuite{
		t:       t,
		require: r,
		muTest:  sync.RWMutex{},

		databaseContainerName: containerName,
		databasePort:          databasePort,
		databaseName:          databaseName,
		databaseUser:          databaseOwner,
		databasePassword:      databasePassword,

		Database: pgDbByOwner,

		Chains: []*itutiltypes.TestChain{
			{
				ChainId:             "evm_1-1",
				Bech32AccAddrPrefix: "ethm",
				MinDenom:            "awei",
				Decimals:            18,
			},
			{
				ChainId:             "wasm_2-2",
				Bech32AccAddrPrefix: "rol",
				MinDenom:            "uno",
				Decimals:            6,
			},
		},
		ValidatorAccounts: newValidatorAccounts(t),
		WalletAccounts:    newWalletsAccounts(t),
	}

	ensureTestEnv(result.databaseName, result.databaseUser, int(result.databasePort))

	if remakeDb {
		for _, tableName := range constants.GetTablesPartitionedByChainId() {
			for _, chain := range result.Chains {
				err := result.createPartitionedTableForChainId(tableName, chain.ChainId)
				require.NoError(t, err)
			}
		}
		for _, tableName := range constants.GetTablesPartitionedByEpochWeekAndChainId() {
			epochWeek := utils.GetEpochWeek(0)
			for _, chain := range result.Chains {
				for ew := epochWeek - 20; ew <= epochWeek+20; ew++ {
					result.createPartitionedTableForEpochWeekAndChainId(tableName, ew, chain.ChainId)
				}
			}
		}
	}

	return result
}

func (suite *DatabaseIntegrationTestSuite) T() *testing.T {
	suite.muTest.RLock()
	defer suite.muTest.RUnlock()
	return suite.t
}

func (suite *DatabaseIntegrationTestSuite) Require() *require.Assertions {
	suite.muTest.RLock()
	defer suite.muTest.RUnlock()
	return suite.require
}

// CreateTransaction begins a new database-level transaction.
func (suite *DatabaseIntegrationTestSuite) CreateTransaction() *sql.Tx {
	tx, err := suite.Database.Begin()
	suite.require.NoError(err, "failed to start transaction")
	return tx
}

// CountRows returns the number of rows of the given table.
// Beware of commit state while working with database transaction.
func (suite *DatabaseIntegrationTestSuite) CountRows(tableName string) int {
	res, err := suite.Database.Query("SELECT COUNT(1) FROM " + tableName)
	defer func() {
		_ = res.Close()
	}()
	suite.Require().NoErrorf(err, "failed to count table %s", tableName)
	suite.Require().Truef(res.Next(), "failed to count table %s", tableName)
	var count int
	err = res.Scan(&count)
	suite.Require().NoErrorf(err, "failed to scan row count for table %s", tableName)
	return count
}

// Truncate does remove all existing records of a given table.
func (suite *DatabaseIntegrationTestSuite) Truncate(tableName string) {
	_, err := suite.Database.Exec("DELETE FROM " + tableName + " WHERE true;")
	suite.Require().NoErrorf(err, "failed to truncate table %s", tableName)
}

// TruncateAll does remove all existing records of all tables.
func (suite *DatabaseIntegrationTestSuite) TruncateAll() {
	suite.Truncate("transaction")
	suite.Truncate("reduced_ref_count_recent_account_transaction")
	suite.Truncate("ref_account_to_recent_tx")
	suite.Truncate("recent_account_transaction")
	suite.Truncate("failed_block")
	suite.Truncate("account")
	suite.Truncate("chain_info")
	suite.Truncate("ibc_transaction")
	suite.Truncate("partition_table_info")
}

// createPartitionedTableForChainId  creates a new partition for the given chain-id.
func (suite *DatabaseIntegrationTestSuite) createPartitionedTableForChainId(tableName, chainId string) error {
	partitionTable := utils.GetPartitionedTableNameByChainId(tableName, chainId)

	stmt := fmt.Sprintf(
		"CREATE TABLE IF NOT EXISTS %s PARTITION OF %s FOR VALUES IN ('%s')",
		partitionTable,
		tableName,
		chainId,
	)

	_, err := suite.Database.Exec(stmt)

	if err != nil {
		content := err.Error()
		if strings.Contains(content, "pq: relation ") && strings.Contains(content, partitionTable) && strings.Contains(content, " already exists") {
			return nil
		}
		return err
	}

	return nil
}

// createPartitionTable creates a new partition table for a given table.
func (suite *DatabaseIntegrationTestSuite) createPartitionedTableForEpochWeekAndChainId(tableName string, epochWeek int64, chainId string) {
	partitionTable := utils.GetPartitionedTableNameBySaltInt64AndChainId(tableName, epochWeek, chainId)
	partitionId := utils.MakePartitionIdFromKeys(epochWeek, chainId)

	stmt := fmt.Sprintf(
		"CREATE TABLE IF NOT EXISTS %s PARTITION OF %s FOR VALUES IN ('%s')",
		partitionTable,
		tableName,
		partitionId,
	)
	_, err := suite.Database.Exec(stmt)
	if err != nil {
		content := err.Error()
		if strings.Contains(content, "pq: relation ") && strings.Contains(content, partitionTable) && strings.Contains(content, " already exists") {
			// ok
			return
		}
	}

	suite.Require().NoErrorf(err, "failed to create partition table %s", tableName)
}

// CleanupSuite performs some cleaning tasks upon shutting down of test suite.
func (suite *DatabaseIntegrationTestSuite) CleanupSuite() {
	err := suite.Database.Close()
	if err != nil {
		fmt.Println("ERR: failed to close database transaction", err)
	}
}

// launchPostgresAsDocker launches a new postgres database as docker container.
func launchPostgresAsDocker() error {
	bz, err := exec.Command(
		"docker", "run",
		"--restart", "unless-stopped",
		"--name", containerName,
		"-d",
		"-p", fmt.Sprintf("%d:5432", databasePort),
		"-e", fmt.Sprintf("POSTGRES_PASSWORD=%s", databasePassword),
		fmt.Sprintf("postgres:%s", containerVersion),
	).Output()
	if err != nil {
		fmt.Println(string(bz))
	}
	return err
}

// shutdownPg shuts down and remove the postgres database docker container.
func shutdownPg() error {
	return exec.Command("docker", "rm", "-f", containerName).Run()
}

// runPsql runs a psql command using psql tool (must be installed)
func runPsql(database, user, commandType, arg string) error {
	cmd := exec.Command(
		"psql",
		"-h", "localhost",
		"-p", fmt.Sprintf("%d", databasePort),
		"-d", database,
		"-U", user,
		commandType, arg,
	)

	cmd.Env = append(os.Environ(), fmt.Sprintf("PGPASSWORD=%s", databasePassword))

	bz, err := cmd.Output()
	if err != nil {
		fmt.Println("psql output:\n", string(bz))
	}
	return err
}

// isPgClosed checks if the postgres database is closed or not available
func isPgClosed() (closed bool, err error) {
	closed = true // default: treating as closed

	var conn net.Conn

	conn, err = net.DialTimeout("tcp", net.JoinHostPort("localhost", fmt.Sprintf("%d", databasePort)), time.Second)
	if err != nil {
		errMsg := err.Error()
		dialingError := strings.Contains(errMsg, "error while dialing") || strings.Contains(errMsg, "connection refused")
		if dialingError {
			err = nil
		} else {
			fmt.Println(err)
			closed = false
		}
	} else {
		if conn != nil {
			defer func() {
				_ = conn.Close()
			}()
			closed = false
		} else {
			closed = false
		}
	}

	return
}

// ensureTestEnv ensures that the database information is valid for testing purpose.
func ensureTestEnv(databaseName, databaseOwner string, databasePort int) {
	if !strings.Contains(databaseName, "test") {
		panic(fmt.Sprintf("database name %s must contain 'test'", databaseName))
	}
	if !strings.Contains(databaseOwner, "test") {
		panic(fmt.Sprintf("database owner %s must contain 'test'", databaseOwner))
	}
	if strings.HasSuffix(fmt.Sprintf("%d", databasePort), "5432") {
		panic(fmt.Sprintf("database port %d is not accepted", databasePort))
	}
}

// openDbConnection opens a new connection to postgres database using given information.
func openDbConnection(t *testing.T, dbName, user string) *sql.DB {
	pgDb, err := sql.Open(
		"postgres",
		fmt.Sprintf(
			"host=localhost port=%d dbname=%s user=%s password=%s sslmode=disable search_path=public",
			databasePort, dbName, user, databasePassword,
		),
	)
	require.NoError(t, err)
	return pgDb
}
