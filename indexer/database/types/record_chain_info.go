package types

import (
	"encoding/json"
	"github.com/pkg/errors"
)

// RecordChainInfo represents a record of table `chain_info` in the database.
type RecordChainInfo struct {
	ChainId            string
	Name               string
	ChainType          string
	Bech32             string
	Denoms             string
	BeJsonRpcUrls      []string
	LatestIndexedBlock int64
}

// NewRecordChainInfoForInsert procedures a new RecordChainInfo for insertion into database
func NewRecordChainInfoForInsert(
	chainId string,
	name string,
	chainType string,
	bech32 map[string]string,
	denoms map[string]string,
	activeBeJsonRpcUrl string,
) (res RecordChainInfo, err error) {
	var bzBech32, bzDenoms []byte

	if len(bech32) > 0 {
		bzBech32, err = json.Marshal(bech32)
		if err != nil {
			err = errors.Wrap(err, "failed to marshal bech32")
			return
		}
	} else {
		bzBech32 = []byte("{}")
	}

	if len(denoms) > 0 {
		bzDenoms, err = json.Marshal(denoms)
		if err != nil {
			err = errors.Wrap(err, "failed to marshal denoms")
			return
		}
	} else {
		bzDenoms = []byte("{}")
	}

	res = RecordChainInfo{
		ChainId:            chainId,
		Name:               name,
		ChainType:          chainType,
		Bech32:             string(bzBech32),
		Denoms:             string(bzDenoms),
		BeJsonRpcUrls:      []string{activeBeJsonRpcUrl},
		LatestIndexedBlock: 0,
	}
	return
}
