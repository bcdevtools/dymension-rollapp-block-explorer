package postgres

import (
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

	stmt := fmt.Sprintf(
		"CREATE TABLE IF NOT EXISTS %s PARTITION OF %s FOR VALUES IN ('%s')",
		partitionTable,
		table,
		chainId,
	)

	_, err := db.Sql.Exec(stmt)

	if err != nil {
		content := err.Error()
		if strings.Contains(content, "pq: relation ") && strings.Contains(content, partitionTable) && strings.Contains(content, " already exists") {
			return nil
		}
		return err
	}

	return nil
}

func (db *Database) PreparePartitionedTablesForEpoch(epochUtcSeconds int64) error {
	db.muCreatePartitionedTables.Lock()
	defer db.muCreatePartitionedTables.Unlock()

	epochWeek := epochUtcSeconds / 86400 * 7
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

	stmt := fmt.Sprintf(
		"CREATE TABLE IF NOT EXISTS %s PARTITION OF %s FOR VALUES IN (%d)",
		partitionTable,
		table,
		epochWeek,
	)

	_, err := db.Sql.Exec(stmt)

	if err != nil {
		content := err.Error()
		if strings.Contains(content, "pq: relation ") && strings.Contains(content, partitionTable) && strings.Contains(content, " already exists") {
			return nil
		}
		return err
	}

	return nil
}
