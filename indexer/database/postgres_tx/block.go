package pg_db_tx

import "github.com/pkg/errors"

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
