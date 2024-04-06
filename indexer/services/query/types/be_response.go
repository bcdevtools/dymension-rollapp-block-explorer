package types

import "fmt"

type BeJsonRpcResponse interface {
	// ValidateBasic ensure response might be valid by performing some basic validation
	ValidateBasic() error
}

var _ BeJsonRpcResponse = ResponseBeGetChainInfo{}

// ResponseBeGetChainInfo is the response for `be_getChainInfo`
type ResponseBeGetChainInfo struct {
	Bech32                  map[string]string `json:"bech32"`
	ChainId                 string            `json:"chainId"`
	ChainType               string            `json:"chainType"`
	Denom                   map[string]string `json:"denoms"`
	LatestBlock             uint64            `json:"latestBlock"`
	LatestBlockTimeEpochUTC uint64            `json:"latestBlockTimeEpochUTC"`
}

func (r ResponseBeGetChainInfo) ValidateBasic() error {
	// ensure every field are not empty
	if len(r.Bech32) < 1 {
		return fmt.Errorf("missing bech32 information")
	}
	if len(r.ChainId) < 1 {
		return fmt.Errorf("missing chain-id")
	}
	if len(r.ChainType) < 1 {
		return fmt.Errorf("missing chain-type")
	}
	if len(r.Denom) < 1 {
		return fmt.Errorf("missing denom")
	}
	if r.LatestBlock < 1 {
		return fmt.Errorf("missing latest block height information")
	}
	if r.LatestBlockTimeEpochUTC < 1 {
		return fmt.Errorf("missing latest block time information")
	}
	return nil
}
