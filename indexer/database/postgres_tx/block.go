package pg_db_tx

import "github.com/pkg/errors"

func (c *dbTxImpl) SetLatestIndexedBlock(chainId string, height int64) error {
	//goland:noinspection SpellCheckingInspection,SqlDialectInspection,SqlNoDataSourceInspection
	sqlRes, err := c.ExecWithContext(`
UPDATE chain_info SET latest_indexed_block = GREATEST($1, latest_indexed_block) WHERE chain_id = $2
`,
		height,  // 1
		chainId, // 2
	)

	if err != nil {
		return errors.Wrapf(err, "failed to update latest indexed block for %s", chainId)
	}

	effected, err := sqlRes.RowsAffected()
	if err != nil {
		return errors.Wrap(err, "failed to get rows effected")
	}
	if effected != 1 {
		return errors.Errorf("expected 1 row effected, got %d", effected)
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
