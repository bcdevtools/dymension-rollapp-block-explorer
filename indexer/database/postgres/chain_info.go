package postgres

import (
	"database/sql"
	"encoding/json"
	"fmt"
	dbtypes "github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/database/types"
	"github.com/lib/pq"
	"github.com/pkg/errors"
	"time"
)

func (db *Database) InsertOrUpdateRecordChainInfo(chainInfo dbtypes.RecordChainInfo) (insertedOrUpdated bool, err error) {
	if err = chainInfo.ValidateBasic(); err != nil {
		err = errors.Wrap(err, "record chain info does not pass basic validation")
		return
	}

	var sqlRes sql.Result

	//goland:noinspection SpellCheckingInspection,SqlDialectInspection,SqlNoDataSourceInspection
	sqlRes, err = db.Sql.Exec(`
INSERT INTO chain_info (chain_id, "name", chain_type, bech32, denoms, be_json_rpc_urls)
VALUES ($1, $2, $3, $4, $5, $6)
ON CONFLICT(chain_id) DO UPDATE
SET chain_type = excluded.chain_type,
    bech32 = excluded.bech32,
    denoms = excluded.denoms,
    be_json_rpc_urls = excluded.be_json_rpc_urls;
`, chainInfo.ChainId, chainInfo.Name, chainInfo.ChainType, chainInfo.Bech32, chainInfo.Denoms, pq.Array(chainInfo.BeJsonRpcUrls))
	if err != nil {
		return
	}

	var effected int64
	effected, err = sqlRes.RowsAffected()
	if err != nil {
		return
	}

	insertedOrUpdated = effected > 0
	return
}

func (db *Database) UpdateBeJsonRpcUrlsIfExists(chainId string, urls []string) (updated bool, err error) {
	defer func() {
		r := recover()
		if r != nil {
			fmt.Println("=== UpdateBeJsonRpcUrlsIfExists panic", r)
			panic(r)
		}
	}()

	var sqlRes sql.Result

	fmt.Println("=== UpdateBeJsonRpcUrlsIfExists before exec")
	//goland:noinspection SpellCheckingInspection,SqlDialectInspection,SqlNoDataSourceInspection
	sqlRes, err = db.Sql.Exec(`
UPDATE chain_info SET be_json_rpc_urls = $1 WHERE chain_id = $2
`, pq.Array(urls), chainId)
	fmt.Println("=== UpdateBeJsonRpcUrlsIfExists after exec")
	if err != nil {
		fmt.Println("=== UpdateBeJsonRpcUrlsIfExists returns by error 1")
		return
	}

	var effected int64
	fmt.Println("=== UpdateBeJsonRpcUrlsIfExists before RowsAffected")
	effected, err = sqlRes.RowsAffected()
	fmt.Println("=== UpdateBeJsonRpcUrlsIfExists after RowsAffected")
	if err != nil {
		fmt.Println("=== UpdateBeJsonRpcUrlsIfExists returns by error 2")
		return
	}

	updated = effected > 0

	fmt.Println("=== UpdateBeJsonRpcUrlsIfExists returns updated =", updated)
	return
}

func (db *Database) GetBech32Config(chainId string) (bech32Cfg dbtypes.Bech32PrefixOfChainInfo, err error) {
	var rows *sql.Rows

	//goland:noinspection SpellCheckingInspection,SqlDialectInspection,SqlNoDataSourceInspection
	rows, err = db.Sql.Query(`
SELECT bech32 FROM chain_info WHERE chain_id = $1
`, chainId)
	if err != nil {
		return
	}

	defer func() {
		_ = rows.Close()
	}()

	if !rows.Next() {
		err = fmt.Errorf("no bech32 config found for chain-id %s", chainId)
		return
	}

	var bech32Json string

	err = rows.Scan(&bech32Json)
	if err != nil {
		return
	}

	if bech32Json == "" || bech32Json == "{}" {
		err = fmt.Errorf("bech32 config is empty for chain-id %s", chainId)
		return
	}

	err = json.Unmarshal([]byte(bech32Json), &bech32Cfg)
	if err != nil {
		err = errors.Wrap(err, "unable to deserialize bech32 config")
		return
	}

	err = bech32Cfg.ValidateBasic()
	if err != nil {
		err = errors.Wrap(err, "bech32 config does not pass basic validation")
		return
	}

	return
}

func (db *Database) IsChainPostponed(chainId string) (postponed bool, err error) {
	var rows *sql.Rows

	//goland:noinspection SpellCheckingInspection,SqlDialectInspection,SqlNoDataSourceInspection
	rows, err = db.Sql.Query(`
SELECT COALESCE(postponed, FALSE), expiry_at_epoch FROM chain_info WHERE chain_id = $1
`, chainId)
	if err != nil {
		return
	}

	defer func() {
		_ = rows.Close()
	}()

	if !rows.Next() {
		return
	}

	var expiryAtEpoch sql.NullInt64
	err = rows.Scan(&postponed, &expiryAtEpoch)
	if err != nil {
		return
	}
	if !postponed {
		postponed = expiryAtEpoch.Valid && expiryAtEpoch.Int64 < time.Now().UTC().Unix()
	}

	return
}
