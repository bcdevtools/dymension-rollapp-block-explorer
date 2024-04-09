package pg_db_tx

import (
	"fmt"
	dbtypes "github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/database/types"
	"github.com/lib/pq"
	"github.com/pkg/errors"
)

func (c *dbTxImpl) InsertOrUpdateRecordsAccount(accounts dbtypes.RecordsAccount) error {
	if len(accounts) == 0 {
		return nil
	}

	if err := accounts.ValidateBasic(); err != nil {
		return errors.Wrap(err, "accounts do not pass basic validation")
	}
	for _, account := range accounts {
		if account.ContinousInsertReferenceCurrentTxCounter != 0 {
			return errors.New("continous insert reference current tx counter must be 0, as it must be altered via triggers")
		}
	}

	stmt := `
INSERT INTO account (
	chain_id,
	bech32_address,
	balance_on_erc20_contracts,
	balance_on_nft_contracts
) VALUES `

	var params []interface{}

	for i, account := range accounts {
		pi := i * 4

		if i > 0 {
			stmt += ","
		}
		stmt += fmt.Sprintf("($%d,$%d,$%d,$%d)", pi+1, pi+2, pi+3, pi+4)
		params = append(
			params,
			account.ChainId,       // 1
			account.Bech32Address, // 2
			pq.Array(account.BalanceOnErc20Contracts), // 3
			pq.Array(account.BalanceOnNftContracts),   // 4
		)
	}

	stmt += `
ON CONFLICT (chain_id, bech32_address) DO UPDATE
SET balance_on_erc20_contracts = account.balance_on_erc20_contracts || excluded.balance_on_erc20_contracts,
	balance_on_nft_contracts = account.balance_on_nft_contracts || excluded.balance_on_nft_contracts
;`

	_, err := c.ExecWithContext(stmt, params...)

	return err
}
