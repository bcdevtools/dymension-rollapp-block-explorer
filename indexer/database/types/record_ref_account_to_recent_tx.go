package types

import (
	"fmt"
	"github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/utils"
)

type RecordsRefAccountToRecentTx []RecordRefAccountToRecentTx

// RecordRefAccountToRecentTx represents a record of table `ref_account_to_recent_tx` in the database.
type RecordRefAccountToRecentTx struct {
	ChainId       string
	Bech32Address string
	Height        int64
	Hash          string

	Signer bool
	Erc20  bool
	NFT    bool
}

// NewRecordRefAccountToRecentTxForInsert procedures a new RecordRefAccountToRecentTx for insertion into database
func NewRecordRefAccountToRecentTxForInsert(
	chainId string,
	bech32Address string,
	height int64,
	hash string,
) RecordRefAccountToRecentTx {
	return RecordRefAccountToRecentTx{
		ChainId:       utils.NormalizeChainId(chainId),
		Bech32Address: utils.NormalizeAddress(bech32Address),
		Height:        height,
		Hash:          hash,
	}
}

func (t RecordsRefAccountToRecentTx) ValidateBasic() error {
	var theOnlyChainId string
	var theOnlyBlockHeight int64
	for _, tx := range t {
		if theOnlyChainId == "" {
			theOnlyChainId = tx.ChainId
		} else if theOnlyChainId != tx.ChainId {
			return fmt.Errorf(
				"all references must have the same chain id, previously got %s, now got %s",
				theOnlyChainId,
				tx.ChainId,
			)
		}

		if theOnlyBlockHeight == 0 {
			theOnlyBlockHeight = tx.Height
		} else if theOnlyBlockHeight != tx.Height {
			return fmt.Errorf(
				"all references must have the same block height, previously got %d, now got %d",
				theOnlyBlockHeight,
				tx.Height,
			)
		}

		if err := tx.ValidateBasic(); err != nil {
			return err
		}
	}

	return nil
}

func (t RecordRefAccountToRecentTx) ValidateBasic() error {
	normalizedChainId := utils.NormalizeChainId(t.ChainId)
	if normalizedChainId != t.ChainId {
		return fmt.Errorf("chain id must be normalized, expected %s, got %s", normalizedChainId, t.ChainId)
	}

	if t.ChainId == "" {
		return fmt.Errorf("chain id cannot be empty")
	}

	normalizedBech32Addr := utils.NormalizeAddress(t.Bech32Address)
	if normalizedBech32Addr != t.Bech32Address {
		return fmt.Errorf("bech32 address must be normalized, expected %s, got %s", normalizedBech32Addr, t.Bech32Address)
	}

	if t.Bech32Address == "" {
		return fmt.Errorf("bech32 address cannot be empty")
	}

	if t.Height < 1 {
		return fmt.Errorf("height must be possitive, got %d", t.Height)
	}

	if !utils.IsValidCosmosTransactionHash(t.Hash) && !utils.IsValidEvmTransactionHash(t.Hash) {
		return fmt.Errorf("invalid transaction hash %s of block %d, neither Cosmos nor EVM format", t.Hash, t.Height)
	}

	return nil
}
