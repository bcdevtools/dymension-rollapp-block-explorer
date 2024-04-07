package pg_db_tx

import (
	"fmt"
	dbtypes "github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/database/types"
	"github.com/lib/pq"
	"github.com/pkg/errors"
)

func (c *dbTxImpl) InsertRecordsRecentAccountTransactionIfNotExists(txs dbtypes.RecordsRecentAccountTransaction) error {
	if len(txs) == 0 {
		return nil
	}

	if err := txs.ValidateBasic(); err != nil {
		return errors.Wrap(err, "recent account transactions do not pass basic validation")
	}

	for _, tx := range txs {
		if tx.RefCount != 0 {
			return fmt.Errorf("ref count must be 0, got %d in tx %s", tx.RefCount, tx.Hash)
		}
	}

	stmt := `
INSERT INTO recent_account_transaction (
	chain_id,
	height,
	hash,
	epoch,
	message_types
) VALUES `

	var params []interface{}

	for i, account := range txs {
		pi := i * 5

		if i > 0 {
			stmt += ","
		}
		stmt += fmt.Sprintf("($%d,$%d,$%d,$%d,$%d)", pi+1, pi+2, pi+3, pi+4, pi+5)
		params = append(
			params,
			account.ChainId,                // 1
			account.Height,                 // 2
			account.Hash,                   // 3
			account.Epoch,                  // 4
			pq.Array(account.MessageTypes), // 5
		)
	}

	stmt += `
ON CONFLICT (chain_id, height, hash) DO NOTHING;`

	_, err := c.ExecWithContext(stmt, params...)

	return err
}
