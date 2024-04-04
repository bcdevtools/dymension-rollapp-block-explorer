package types

// RecordChainInfo represents a record of table `chain_info` in the database.
type RecordChainInfo struct {
	ChainId       string            `json:"chain_id"`
	Name          string            `json:"name"`
	ChainType     string            `json:"chain_type"`
	Bech32        map[string]string `json:"bech32"`
	Denoms        map[string]string `json:"denoms"`
	BeJsonRpcUrls []string          `json:"be_json_rpc_urls"`
}
