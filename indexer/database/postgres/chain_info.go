package postgres

import (
	"database/sql"
	dbtypes "github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/database/types"
	"github.com/lib/pq"
)

func (db *Database) InsertRecordChainInfoIfNotExists(chainInfo dbtypes.RecordChainInfo) (inserted bool, err error) {
	var sqlRes sql.Result

	//goland:noinspection SpellCheckingInspection,SqlDialectInspection,SqlNoDataSourceInspection
	sqlRes, err = db.Sql.Exec(`
INSERT INTO chain_info (chain_id, "name", chain_type, bech32, denoms, be_json_rpc_urls)
VALUES ($1, $2, $3, $4, $5, $6)
ON CONFLICT DO NOTHING;
`, chainInfo.ChainId, chainInfo.Name, chainInfo.ChainType, chainInfo.Bech32, chainInfo.Denoms, pq.Array(chainInfo.BeJsonRpcUrls))
	if err != nil {
		return
	}

	var effected int64
	effected, err = sqlRes.RowsAffected()
	if err != nil {
		return
	}

	inserted = effected > 0
	return
}

func (db *Database) UpdateBeJsonRpcUrlsIfExists(chainId string, urls []string) (updated bool, err error) {
	var sqlRes sql.Result

	//goland:noinspection SpellCheckingInspection,SqlDialectInspection,SqlNoDataSourceInspection
	sqlRes, err = db.Sql.Exec(`
UPDATE chain_info SET be_json_rpc_urls = $1 WHERE chain_id = $2
`, pq.Array(urls), chainId)
	if err != nil {
		return
	}

	var effected int64
	effected, err = sqlRes.RowsAffected()
	if err != nil {
		return
	}

	updated = effected > 0
	return
}
