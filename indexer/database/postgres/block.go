package postgres

import (
	"github.com/lib/pq"
	"github.com/pkg/errors"
	"time"
)

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