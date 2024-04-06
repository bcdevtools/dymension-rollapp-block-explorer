package types

import (
	"encoding/json"
	"github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/utils"
	"github.com/pkg/errors"
	"strings"
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
		ChainId:            utils.NormalizeChainId(chainId),
		Name:               utils.NormalizeChainId(name),
		ChainType:          strings.ToLower(chainType),
		Bech32:             string(bzBech32),
		Denoms:             string(bzDenoms),
		BeJsonRpcUrls:      []string{activeBeJsonRpcUrl},
		LatestIndexedBlock: 0,
	}
	return
}

// ValidateBasic validates the basic fields of RecordChainInfo
func (r RecordChainInfo) ValidateBasic() error {
	normalizedChainId := strings.ToLower(r.ChainId)
	if normalizedChainId != r.ChainId {
		return errors.Errorf("chain id must be normalized, expected %s, got %s", normalizedChainId, r.ChainId)
	}

	if r.ChainId == "" {
		return errors.New("chain id cannot be empty")
	}

	normalizedName := strings.ToLower(r.Name)
	if normalizedName != r.Name {
		return errors.Errorf("name must be normalized, expected %s, got %s", normalizedName, r.Name)
	}

	if r.Name == "" {
		return errors.New("chain name cannot be empty")
	}

	normalizedChainType := strings.ToLower(r.ChainType)
	if normalizedChainType != r.ChainType {
		return errors.Errorf("chain type must be normalized, expected %s, got %s", normalizedChainType, r.ChainType)
	}

	if r.ChainType == "" {
		return errors.New("chain type cannot be empty")
	}

	if r.Bech32 == "" {
		return errors.New("bech32 information cannot be empty")
	}

	if r.Denoms == "" {
		return errors.New("denoms information cannot be empty")
	}

	if r.LatestIndexedBlock < 0 {
		return errors.New("latest indexed block cannot be negative")
	}

	return nil
}
