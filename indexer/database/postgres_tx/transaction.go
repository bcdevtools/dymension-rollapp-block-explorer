package pg_db_tx

import (
	"database/sql"
	"fmt"
	dbtypes "github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/database/types"
	"github.com/lib/pq"
	"github.com/pkg/errors"
)

func (c *dbTxImpl) InsertRecordTransactionsIfNotExists(txs dbtypes.RecordsTransaction) error {
	if len(txs) == 0 {
		return nil
	}

	if err := txs.ValidateBasic(); err != nil {
		return errors.Wrap(err, "transactions do not pass basic validation")
	}

	stmt := `
INSERT INTO transaction (
	chain_id,
	height,
	hash,
	partition_id,
	epoch,
	message_types,
	tx_type,
	"action",
	"value"
) VALUES `

	var params []interface{}

	for i, account := range txs {
		pi := i * 9

		if i > 0 {
			stmt += ","
		}
		stmt += fmt.Sprintf("($%d,$%d,$%d,$%d,$%d,$%d,$%d,$%d,$%d)", pi+1, pi+2, pi+3, pi+4, pi+5, pi+6, pi+7, pi+8, pi+9)
		params = append(
			params,
			account.ChainId,                // 1
			account.Height,                 // 2
			account.Hash,                   // 3
			account.PartitionId,            // 4
			account.Epoch,                  // 5
			pq.Array(account.MessageTypes), // 6
			account.TxType,                 // 7
			sql.NullString{ // 8
				String: account.Action,
				Valid:  account.Action != "",
			},
			pq.Array(account.Value), // 9
		)
	}

	stmt += `
ON CONFLICT (chain_id, height, hash, partition_id) DO NOTHING;`

	_, err := c.ExecWithContext(stmt, params...)

	return err
}

func (c *dbTxImpl) CleanupZeroRefCountRecentAccountTransaction() error {
	_, err := c.ExecWithContext(`CALL func_cleanup_zero_ref_count_recent_account_transaction();`)
	return err
}
