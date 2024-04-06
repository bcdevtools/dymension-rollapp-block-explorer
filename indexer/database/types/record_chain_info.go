package types

// RecordChainInfo represents a record of table `chain_info` in the database.
type RecordChainInfo struct {
	ChainId            string
	Name               string
	ChainType          string
	Bech32             map[string]string
	Denoms             map[string]string
	BeJsonRpcUrls      []string
	LatestIndexedBlock int64
}
