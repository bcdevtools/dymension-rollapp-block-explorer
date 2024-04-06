package types

import (
	"fmt"
	"github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/utils"
)

type RecordsAccount []RecordAccount

type RecordAccount struct {
	ChainId                                  string
	Bech32Address                            string
	ContinousInsertReferenceCurrentTxCounter int16
	BalanceOnErc20Contracts                  []string
	BalanceOnNftContracts                    []string
}

// NewRecordAccountForInsert procedures a new RecordAccount for insertion into database
func NewRecordAccountForInsert(
	chainId string,
	bech32Address string,
) RecordAccount {
	return RecordAccount{
		ChainId:                                  utils.NormalizeChainId(chainId),
		Bech32Address:                            utils.NormalizeAddress(bech32Address),
		ContinousInsertReferenceCurrentTxCounter: 0,
		BalanceOnErc20Contracts:                  []string{},
		BalanceOnNftContracts:                    []string{},
	}
}

func (a RecordsAccount) ValidateBasic() error {
	var theOnlyChainId string
	for _, account := range a {
		if theOnlyChainId == "" {
			theOnlyChainId = account.ChainId
		} else if theOnlyChainId != account.ChainId {
			return fmt.Errorf(
				"all accounts must have the same chain id, previously got %s, now got %s",
				theOnlyChainId,
				account.ChainId,
			)
		}

		if err := account.ValidateBasic(); err != nil {
			return err
		}
	}

	return nil
}

func (a RecordAccount) ValidateBasic() error {
	normalizedChainId := utils.NormalizeChainId(a.ChainId)
	if normalizedChainId != a.ChainId {
		return fmt.Errorf("chain id must be normalized, expected %s, got %s", normalizedChainId, a.ChainId)
	}

	if a.ChainId == "" {
		return fmt.Errorf("chain id cannot be empty")
	}

	normalizedBech32Addr := utils.NormalizeAddress(a.Bech32Address)
	if normalizedBech32Addr != a.Bech32Address {
		return fmt.Errorf("bech32 address must be normalized, expected %s, got %s", normalizedBech32Addr, a.Bech32Address)
	}

	if a.Bech32Address == "" {
		return fmt.Errorf("bech32 address cannot be empty")
	}
	// WARNING: do not attempt to validate bech32 address here,
	// as it may be wrong format because message can actually be input wrong format

	if a.ContinousInsertReferenceCurrentTxCounter < 0 {
		return fmt.Errorf("continous insert reference current tx counter must be non-negative, got %d", a.ContinousInsertReferenceCurrentTxCounter)
	}

	if len(a.BalanceOnErc20Contracts) > 0 {
		for _, contract := range a.BalanceOnErc20Contracts {
			if contract == "" {
				return fmt.Errorf("balance on ERC-20/CW-20 contract address cannot be empty string")
			}
			normalizedContract := utils.NormalizeAddress(contract)
			if normalizedContract != contract {
				return fmt.Errorf("ERC-20/CW-20 contract address must be normalized, expected %s, got %s", normalizedContract, contract)
			}
		}
	}

	if len(a.BalanceOnNftContracts) > 0 {
		for _, contract := range a.BalanceOnNftContracts {
			if contract == "" {
				return fmt.Errorf("balance on NFT contract address cannot be empty string")
			}
			normalizedContract := utils.NormalizeAddress(contract)
			if normalizedContract != contract {
				return fmt.Errorf("NFT contract address must be normalized, expected %s, got %s", normalizedContract, contract)
			}
		}
	}

	return nil
}
