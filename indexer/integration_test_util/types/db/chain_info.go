package db

type ChainInfoRecord struct {
	ChainId            string
	Name               string
	ChainType          string
	Bech32Json         string
	DenomsJson         string
	BeJsonRpcUrls      []string
	LatestIndexedBlock int64
}
