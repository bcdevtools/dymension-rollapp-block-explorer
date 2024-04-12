package postgres

import (
	"database/sql"
	"github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/constants"
	"github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/utils"
	"github.com/lib/pq"
	"github.com/pkg/errors"
	"time"
)

func (db *Database) GetLatestIndexedBlock(chainId string) (int64, error) {
	//goland:noinspection SpellCheckingInspection,SqlDialectInspection,SqlNoDataSourceInspection
	row := db.Sql.QueryRow(`
SELECT latest_indexed_block FROM chain_info WHERE chain_id = $1
`,
		chainId, // 1
	)

	var height int64
	err := row.Scan(&height)
	if err != nil {
		return 0, errors.Wrapf(err, "failed to get latest indexed block for %s", chainId)
	}

	return height, nil
}

func (db *Database) SetLatestIndexedBlock(chainId string, height int64) error {
	//goland:noinspection SpellCheckingInspection,SqlDialectInspection,SqlNoDataSourceInspection
	_, err := db.Sql.Exec(`
UPDATE chain_info
SET latest_indexed_block = $1, increased_latest_indexed_block_at = $2
WHERE chain_id = $3 AND latest_indexed_block < $1
`,
		height,                  // 1
		time.Now().UTC().Unix(), // 2
		chainId,                 // 3
	)

	if err != nil {
		return errors.Wrapf(err, "failed to update latest indexed block for %s", chainId)
	}

	return nil
}

func (db *Database) InsertOrUpdateFailedBlock(chainId string, height int64, optionalReason error) error {
	var errs []string
	if optionalReason == nil {
		errs = []string{}
	} else {
		errs = []string{optionalReason.Error()}
	}
	//goland:noinspection SpellCheckingInspection,SqlDialectInspection,SqlNoDataSourceInspection
	_, err := db.Sql.Exec(`
INSERT INTO failed_block(chain_id, height, last_retry_epoch, error_messages)
VALUES ($1, $2, $3, $4)
ON CONFLICT(chain_id, height) DO UPDATE
SET retry_count = failed_block.retry_count + 1,
    last_retry_epoch = GREATEST(excluded.last_retry_epoch, failed_block.last_retry_epoch),
    error_messages = excluded.error_messages || failed_block.error_messages
`,
		chainId,                 // 1
		height,                  // 2
		time.Now().UTC().Unix(), // 3
		pq.Array(errs),          // 4
	)

	if err != nil {
		return errors.Wrap(err, "failed to insert or update failed block")
	}

	return nil
}

func (db *Database) GetOneFailedBlock(chainId string) (height int64, err error) {
	tableName := utils.GetPartitionedTableNameByChainId("failed_block", chainId)

	var rows *sql.Rows

	//goland:noinspection SpellCheckingInspection,SqlDialectInspection,SqlNoDataSourceInspection
	rows, err = db.Sql.Query(`
SELECT COALESCE(height, 0) FROM `+tableName+`
WHERE chain_id = $1 AND retry_count < $2 AND last_retry_epoch < $3
ORDER BY height DESC
LIMIT 1
`,
		chainId, // 1
		constants.RetryIndexingFailedBlockMaxRetries,                         // 2
		time.Now().UTC().Unix()-constants.RetryIndexingFailedBlockGapSeconds, // 3
	)

	if err != nil {
		err = errors.Wrap(err, "failed to get failed block")
		return
	}

	if !rows.Next() {
		return
	}

	err = rows.Scan(&height)
	if err != nil {
		err = errors.Wrap(err, "failed to scan result of failed block")
		return
	}

	return
}
