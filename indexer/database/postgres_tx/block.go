package pg_db_tx

import (
	"github.com/pkg/errors"
	"time"
)

func (c *dbTxImpl) SetLatestIndexedBlock(chainId string, height int64) error {
	//goland:noinspection SpellCheckingInspection,SqlDialectInspection,SqlNoDataSourceInspection
	_, err := c.ExecWithContext(`
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

func (c *dbTxImpl) RemoveFailedBlockRecord(chainId string, height int64) error {
	_, err := c.ExecWithContext(`
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
