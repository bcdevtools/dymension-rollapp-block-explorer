package pg_db_tx

import (
	"database/sql"
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
	message_types,
	"action",
	"value"
) VALUES `

	var params []interface{}

	for i, tx := range txs {
		pi := i * 7

		if i > 0 {
			stmt += ","
		}
		stmt += fmt.Sprintf("($%d,$%d,$%d,$%d,$%d,$%d,$%d)", pi+1, pi+2, pi+3, pi+4, pi+5, pi+6, pi+7)
		params = append(
			params,
			tx.ChainId,                // 1
			tx.Height,                 // 2
			tx.Hash,                   // 3
			tx.Epoch,                  // 4
			pq.Array(tx.MessageTypes), // 5
			sql.NullString{ // 6
				String: tx.Action,
				Valid:  tx.Action != "",
			},
			pq.Array(tx.Value), // 7
		)
	}

	stmt += `
ON CONFLICT (chain_id, height, hash) DO NOTHING;`

	_, err := c.ExecWithContext(stmt, params...)

	return err
}

func (c *dbTxImpl) InsertRecordsRefAccountToRecentTxIfNotExists(refs dbtypes.RecordsRefAccountToRecentTx) error {
	if len(refs) == 0 {
		return nil
	}

	if err := refs.ValidateBasic(); err != nil {
		return errors.Wrap(err, "ref account to recent tx do not pass basic validation")
	}

	stmt := `
INSERT INTO ref_account_to_recent_tx (
	chain_id,
	bech32_address,
	height,
	hash,
	signer,
	erc20,
	nft
) VALUES `

	var params []interface{}

	for i, ref := range refs {
		pi := i * 7

		if i > 0 {
			stmt += ","
		}
		stmt += fmt.Sprintf("($%d,$%d,$%d,$%d,$%d,$%d,$%d)", pi+1, pi+2, pi+3, pi+4, pi+5, pi+6, pi+7)
		params = append(
			params,
			ref.ChainId,       // 1
			ref.Bech32Address, // 2
			ref.Height,        // 3
			ref.Hash,          // 4
			sql.NullBool{
				Bool:  ref.Signer,
				Valid: ref.Signer,
			}, // 5
			sql.NullBool{
				Bool:  ref.Erc20,
				Valid: ref.Erc20,
			}, // 6
			sql.NullBool{
				Bool:  ref.NFT,
				Valid: ref.NFT,
			}, // 7
		)
	}

	stmt += `
ON CONFLICT (chain_id, bech32_address, height, hash) DO NOTHING;`

	_, err := c.ExecWithContext(stmt, params...)

	return err
}
