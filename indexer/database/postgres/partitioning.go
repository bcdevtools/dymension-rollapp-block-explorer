package postgres

import (
	"database/sql"
	"fmt"
	"github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/constants"
	"github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/utils"
	"github.com/pkg/errors"
	"strings"
)

func (db *Database) PreparePartitionedTablesForChainId(chainId string) error {
	db.muCreatePartitionedTables.Lock()
	defer db.muCreatePartitionedTables.Unlock()

	for _, tableName := range constants.GetTablesPartitionedByChainId() {
		err := db.createPartitionedTableForChainIdIfNotExists(tableName, chainId)
		if err != nil {
			return errors.Wrap(err, fmt.Sprintf("failed to create partitioned table of table %s for chain-id: %s", tableName, chainId))
		}
	}

	return nil
}

// createPartitionedTableForChainIdIfNotExists creates a new partition for the given chain-id if not exists.
func (db *Database) createPartitionedTableForChainIdIfNotExists(table, chainId string) error {
	partitionTable := utils.GetPartitionedTableNameByChainId(table, chainId)
	partitionId := chainId

	stmt := fmt.Sprintf(
		"CREATE TABLE IF NOT EXISTS %s PARTITION OF %s FOR VALUES IN ('%s')",
		partitionTable,
		table,
		partitionId,
	)

	_, err := db.Sql.Exec(stmt)

	if err != nil {
		if isErrPartitionTableAlreadyExists(err, partitionTable) {
			return nil
		}
		return err
	}

	err = db.insertNewPartitionedTableInfoIfNotExists(table, partitionTable, partitionId, chainId)
	if err != nil {
		return errors.Wrap(err, fmt.Sprintf("failed to insert new partitioned table info for %s", partitionTable))
	}

	return nil
}

func (db *Database) PreparePartitionedTablesForEpoch(epochUtcSeconds int64) error {
	db.muCreatePartitionedTables.Lock()
	defer db.muCreatePartitionedTables.Unlock()

	epochWeek := utils.GetEpochWeek(epochUtcSeconds)
	for _, tableName := range constants.GetTablesPartitionedByEpochWeek() {
		err := db.createPartitionedTableForEpochWeekIfNotExists(tableName, epochWeek)
		if err != nil {
			return errors.Wrap(err, fmt.Sprintf("failed to create partitioned table of table %s for epoch week: %d", tableName, epochWeek))
		}
	}

	return nil
}

// createPartitionedTableForEpochWeekIfNotExists creates a new partition for the given epoch week if not exists.
func (db *Database) createPartitionedTableForEpochWeekIfNotExists(table string, epochWeek int64) error {
	partitionTable := fmt.Sprintf("%s_%d", table, epochWeek)
	partitionId := epochWeek

	stmt := fmt.Sprintf(
		"CREATE TABLE IF NOT EXISTS %s PARTITION OF %s FOR VALUES IN (%d)",
		partitionTable,
		table,
		partitionId,
	)

	_, err := db.Sql.Exec(stmt)

	if err != nil {
		if isErrPartitionTableAlreadyExists(err, partitionTable) {
			return nil
		}
		return err
	}

	err = db.insertNewPartitionedTableInfoIfNotExists(table, partitionTable, fmt.Sprintf("%d", partitionId), epochWeek)
	if err != nil {
		return errors.Wrap(err, fmt.Sprintf("failed to insert new partitioned table info for %s", partitionTable))
	}

	return nil
}

func (db *Database) PreparePartitionedTablesForEpochAndChainId(epochUtcSeconds int64, chainId string) error {
	db.muCreatePartitionedTables.Lock()
	defer db.muCreatePartitionedTables.Unlock()

	epochWeek := utils.GetEpochWeek(epochUtcSeconds)
	for _, tableName := range constants.GetTablesPartitionedByEpochWeekAndChainId() {
		err := db.createPartitionedTableForEpochWeekAndChainIdIfNotExists(tableName, epochWeek, chainId)
		if err != nil {
			return errors.Wrap(err, fmt.Sprintf("failed to create partitioned table of table %s for epoch week & chain id: [%d. %s]", tableName, epochWeek, chainId))
		}
	}

	return nil
}

// createPartitionedTableForEpochWeekIfNotExists creates a new partition for the given epoch week and chain_id if not exists.
func (db *Database) createPartitionedTableForEpochWeekAndChainIdIfNotExists(table string, epochWeek int64, chainId string) error {
	partitionTable := utils.GetPartitionedTableNameBySaltInt64AndChainId(table, epochWeek, chainId)
	partitionId := fmt.Sprintf("%d %s", epochWeek, chainId)

	stmt := fmt.Sprintf(
		"CREATE TABLE IF NOT EXISTS %s PARTITION OF %s FOR VALUES IN ('%s')",
		partitionTable,
		table,
		partitionId,
	)

	_, err := db.Sql.Exec(stmt)

	if err != nil {
		if isErrPartitionTableAlreadyExists(err, partitionTable) {
			return nil
		}
		return err
	}

	err = db.insertNewPartitionedTableInfoIfNotExists(table, partitionTable, partitionId, epochWeek, chainId)
	if err != nil {
		return errors.Wrap(err, fmt.Sprintf("failed to insert new partitioned table info for %s", partitionTable))
	}

	return nil
}

func (db *Database) insertNewPartitionedTableInfoIfNotExists(largeTableName, partitionedTableName, partitionedKeyStr string, partitionKeyParts ...any) error {
	if !strings.HasPrefix(partitionedTableName, fmt.Sprintf("%s_", largeTableName)) {
		return fmt.Errorf("invalid partitioned table name: %s, must starts with %s_", partitionedTableName, largeTableName)
	}

	if largeTableName == "" {
		return fmt.Errorf("invalid large table name, must not be empty")
	}
	if partitionedKeyStr == "" {
		return fmt.Errorf("invalid partition key, must not be empty")
	}

	countPartsOfPartitionKey := len(partitionKeyParts)
	if countPartsOfPartitionKey < 1 {
		return fmt.Errorf("invalid partition key parts, must have at least 1 part")
	}
	if countPartsOfPartitionKey > 2 {
		return fmt.Errorf("invalid partition key parts, currently supported at most 2 parts")
	}
	if partitionKeyParts[0] == nil {
		return fmt.Errorf("invalid partition key part 1, must not be nil")
	}

	var partitionKeyPart1Str, partitionKeyPart2Str string

	partitionKeyPart1Str = fmt.Sprintf("%v", partitionKeyParts[0])
	if partitionKeyPart1Str == "" {
		return fmt.Errorf("invalid partition key part 1, must not be empty")
	}

	if countPartsOfPartitionKey > 1 {
		partitionKeyPart2Str = fmt.Sprintf("%v", partitionKeyParts[1])
	}

	//goland:noinspection SqlNoDataSourceInspection,SqlDialectInspection
	_, err := db.Sql.Exec(`
INSERT INTO partition_table_info (
	partition_table_name,
	large_table_name,
	partition_key,
	partition_key_part_1,
	partition_key_part_2
)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT(partition_table_name) DO NOTHING`,
		partitionedTableName, // 1
		largeTableName,       // 2
		partitionedKeyStr,    // 3
		partitionKeyPart1Str, // 4
		sql.NullString{ // 5
			String: partitionKeyPart2Str,
			Valid:  len(partitionKeyPart2Str) > 0,
		},
	)

	if err != nil {
		return err
	}

	return nil
}

func isErrPartitionTableAlreadyExists(err error, partitionTable string) bool {
	content := err.Error()
	return strings.Contains(content, "pq: relation ") && strings.Contains(content, partitionTable) && strings.Contains(content, " already exists")
}
