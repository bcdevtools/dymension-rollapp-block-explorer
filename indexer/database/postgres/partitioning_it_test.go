package postgres

import (
	"fmt"
)

//goland:noinspection SqlDialectInspection,SqlNoDataSourceInspection
func (suite *IntegrationTestSuite) Test_PreparePartitionedTablesForChainId_IT() {
	db := suite.Database()

	cntPartitionedTablesInfo := suite.CountRows2("partition_table_info")

	for id := 1; id <= 10; id++ {
		err := db.PreparePartitionedTablesForChainId(fmt.Sprintf("chain-id-%d", id))
		suite.Require().NoError(err)

		newCntPartitionedTablesInfo := suite.CountRows2("partition_table_info")
		suite.Less(cntPartitionedTablesInfo, newCntPartitionedTablesInfo, "new records must be added into partition_table_info")
		cntPartitionedTablesInfo = newCntPartitionedTablesInfo
	}

	err := db.PreparePartitionedTablesForChainId(fmt.Sprintf("chain-id-%d", 1))
	suite.Require().NoError(err)
	suite.Equal(cntPartitionedTablesInfo, suite.CountRows2("partition_table_info"), "no new record for existing chain-id")

	rows, err := db.Sql.Query("SELECT partition_table_name FROM partition_table_info")
	suite.Require().NoError(err)
	defer func() {
		_ = rows.Close()
	}()

	for rows.Next() {
		var partitionTableName string
		err = rows.Scan(&partitionTableName)
		suite.Require().NoError(err)
		suite.Require().NotEmpty(partitionTableName)

		suite.Require().Zero(suite.CountRows2(partitionTableName), "new partitioned table must be created")
	}
}

//goland:noinspection SqlDialectInspection,SqlNoDataSourceInspection
func (suite *IntegrationTestSuite) Test_PreparePartitionedTablesForEpoch_Week_IT() {
	db := suite.Database()

	cntPartitionedTablesInfo := suite.CountRows2("partition_table_info")

	generateEpochOfWeek := func(weekNo int) int64 {
		return (86400 * 7) * int64(weekNo)
	}

	for id := 1; id <= 10; id++ {
		err := db.PreparePartitionedTablesForEpoch(generateEpochOfWeek(id))
		suite.Require().NoError(err)

		newCntPartitionedTablesInfo := suite.CountRows2("partition_table_info")
		suite.Less(cntPartitionedTablesInfo, newCntPartitionedTablesInfo, "new records must be added into partition_table_info")
		cntPartitionedTablesInfo = newCntPartitionedTablesInfo
	}

	err := db.PreparePartitionedTablesForEpoch(generateEpochOfWeek(1))
	suite.Require().NoError(err)
	suite.Equal(cntPartitionedTablesInfo, suite.CountRows2("partition_table_info"), "no new record for existing weeks")

	rows, err := db.Sql.Query("SELECT partition_table_name FROM partition_table_info")
	suite.Require().NoError(err)
	defer func() {
		_ = rows.Close()
	}()

	for rows.Next() {
		var partitionTableName string
		err = rows.Scan(&partitionTableName)
		suite.Require().NoError(err)
		suite.Require().NotEmpty(partitionTableName)

		suite.Require().Zero(suite.CountRows2(partitionTableName), "new partitioned table must be created")
	}
}

//goland:noinspection SqlDialectInspection,SqlNoDataSourceInspection
func (suite *IntegrationTestSuite) Test_DropPartitionedTables_IT() {
	db := suite.Database()

	cntPartitionedTablesInfo := suite.CountRows2("partition_table_info")

	for id := 1; id <= 15; id++ {
		err := db.PreparePartitionedTablesForEpoch((86400 * 7) * int64(id))
		suite.Require().NoError(err)

		newCntPartitionedTablesInfo := suite.CountRows2("partition_table_info")
		suite.Less(cntPartitionedTablesInfo, newCntPartitionedTablesInfo, "new records must be added into partition_table_info")
		cntPartitionedTablesInfo = newCntPartitionedTablesInfo
	}

	cntTablesToDrop := cntPartitionedTablesInfo / 2

	var partitionTablesName []string
	func() {
		rows, err := db.Sql.Query("SELECT partition_table_name FROM partition_table_info LIMIT $1", cntTablesToDrop)
		suite.Require().NoError(err)
		defer func() {
			_ = rows.Close()
		}()

		for rows.Next() {
			var partitionTableName string
			err = rows.Scan(&partitionTableName)
			suite.Require().NoError(err)
			suite.Require().NotEmpty(partitionTableName)

			partitionTablesName = append(partitionTablesName, partitionTableName)
		}
	}()

	for _, partitionedTableName := range partitionTablesName {
		_, err := db.Sql.Exec(`DROP TABLE IF EXISTS ` + partitionedTableName)
		suite.Require().NoError(err)
	}

	suite.Require().Equal(cntPartitionedTablesInfo-cntTablesToDrop, suite.CountRows2("partition_table_info"))
}
