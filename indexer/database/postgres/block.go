package postgres

import (
	"database/sql"
	"fmt"
	"github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/constants"
	"github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/utils"
	"github.com/lib/pq"
	"github.com/pkg/errors"
	"time"
)

func (db *Database) GetLatestIndexedBlock(chainId string) (height int64, postponed bool, err error) {
	//goland:noinspection SpellCheckingInspection,SqlDialectInspection,SqlNoDataSourceInspection
	row := db.Sql.QueryRow(`
SELECT latest_indexed_block, COALESCE(postponed, FALSE), expiry_at_epoch FROM chain_info WHERE chain_id = $1
`,
		chainId, // 1
	)

	var expiryAtEpoch sql.NullInt64
	err = row.Scan(&height, &postponed, &expiryAtEpoch)
	if err != nil {
		err = errors.Wrapf(err, "failed to get latest indexed block for %s", chainId)
		return
	}
	if !postponed {
		postponed = expiryAtEpoch.Valid && expiryAtEpoch.Int64 < time.Now().UTC().Unix()
	}

	return
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

//goland:noinspection SpellCheckingInspection,SqlDialectInspection,SqlNoDataSourceInspection
func (db *Database) InsertOrUpdateFailedBlocks(chainId string, blocksHeight []int64, optionalReason error) error {
	var errs []string
	if optionalReason == nil {
		errs = []string{}
	} else {
		errs = []string{optionalReason.Error()}
	}

	stmt := `
INSERT INTO failed_block(chain_id, last_retry_epoch, error_messages, height)
VALUES `

	params := []any{
		chainId,                 // 1
		time.Now().UTC().Unix(), // 2
		pq.Array(errs),          // 3
	}

	for i, height := range blocksHeight {
		pi := i + 4

		if i > 0 {
			stmt += ","
		}
		stmt += fmt.Sprintf("($1,$2,$3,$%d)", pi)
		params = append(
			params,
			height,
		)
	}

	stmt += `ON CONFLICT(chain_id, height) DO UPDATE
SET retry_count = failed_block.retry_count + 1,
    last_retry_epoch = GREATEST(excluded.last_retry_epoch, failed_block.last_retry_epoch),
    error_messages = excluded.error_messages || failed_block.error_messages
`

	_, err := db.Sql.Exec(stmt, params...)

	if err != nil {
		return errors.Wrap(err, "failed to insert or update failed blocks")
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
		chainId,                                                              // 1
		constants.RetryIndexingFailedBlockMaxRetries,                         // 2
		time.Now().UTC().Unix()-constants.RetryIndexingFailedBlockGapSeconds, // 3
	)

	if err != nil {
		err = errors.Wrap(err, "failed to get failed block")
		return
	}

	defer func() {
		_ = rows.Close()
	}()

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

func (db *Database) GetFailedBlocksInRange(chainId string, from, to int64) (blocksHeight []int64, err error) {
	defer func() {
		if err != nil {
			blocksHeight = nil
		}
	}()

	tableName := utils.GetPartitionedTableNameByChainId("failed_block", chainId)

	var rows *sql.Rows

	//goland:noinspection SpellCheckingInspection,SqlDialectInspection,SqlNoDataSourceInspection
	rows, err = db.Sql.Query(`
SELECT height FROM `+tableName+`
WHERE chain_id = $1 AND height >= $2 AND height <= $3
`,
		chainId, // 1
		from,    // 2
		to,      // 3
	)

	if err != nil {
		err = errors.Wrap(err, "failed to get failed block")
		return
	}

	defer func() {
		_ = rows.Close()
	}()

	for rows.Next() {
		var height int64
		err = rows.Scan(&height)
		if err != nil {
			err = errors.Wrap(err, "failed to scan result of failed block")
			return
		}
		blocksHeight = append(blocksHeight, height)
	}

	return
}

func (db *Database) RemoveFailedBlockRecord(chainId string, height int64) error {
	//goland:noinspection SpellCheckingInspection,SqlDialectInspection,SqlNoDataSourceInspection
	_, err := db.Sql.Exec(`
DELETE FROM failed_block WHERE chain_id = $1 AND height = $2
`,
		chainId, // 1
		height,  // 2
	)

	if err != nil {
		return errors.Wrap(err, "failed to delete failed block record")
	}

	return nil
}
