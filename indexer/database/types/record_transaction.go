package types

import (
	"fmt"
	"github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/utils"
)

type RecordsTransaction []RecordTransaction

type RecordTransaction struct {
	ChainId     string
	Height      int64
	Hash        string
	PartitionId string

	Epoch        int64
	MessageTypes []string
	TxType       string
	Action       string
	Value        []string
}

// NewRecordTransactionForInsert procedures a new RecordTransaction for insertion into database
func NewRecordTransactionForInsert(
	chainId string,
	height int64,
	hash string,

	epoch int64,
	messageTypes []string,
	txType string,
) RecordTransaction {
	chainId = utils.NormalizeChainId(chainId)
	return RecordTransaction{
		ChainId:      chainId,
		Height:       height,
		Hash:         hash,
		PartitionId:  "",
		Epoch:        epoch,
		MessageTypes: messageTypes,
		TxType:       txType,
	}
}

func (t RecordsTransaction) ValidateBasic() error {
	var theOnlyChainId string
	var theOnlyBlockHeight int64
	for _, tx := range t {
		if theOnlyChainId == "" {
			theOnlyChainId = tx.ChainId
		} else if theOnlyChainId != tx.ChainId {
			return fmt.Errorf(
				"all transactions must have the same chain id, previously got %s, now got %s",
				theOnlyChainId,
				tx.ChainId,
			)
		}

		if theOnlyBlockHeight == 0 {
			theOnlyBlockHeight = tx.Height
		} else if theOnlyBlockHeight != tx.Height {
			return fmt.Errorf(
				"all transactions must have the same block height, previously got %d, now got %d",
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

func (t RecordTransaction) ValidateBasic() error {
	normalizedChainId := utils.NormalizeChainId(t.ChainId)
	if normalizedChainId != t.ChainId {
		return fmt.Errorf("chain id must be normalized, expected %s, got %s", normalizedChainId, t.ChainId)
	}

	if t.ChainId == "" {
		return fmt.Errorf("chain id cannot be empty")
	}

	if t.Height < 1 {
		return fmt.Errorf("height must be possitive, got %d", t.Height)
	}

	if t.PartitionId != "" {
		return fmt.Errorf("partition id must not be set, got %s", t.PartitionId)
	}

	if t.Epoch < 1 {
		return fmt.Errorf("epoch must be possitive, got %d", t.Epoch)
	}

	if len(t.MessageTypes) < 1 {
		return fmt.Errorf("message types cannot be empty")
	}

	switch t.TxType {
	case "cosmos", "wasm":
		// ok
		if !utils.IsValidCosmosTransactionHash(t.Hash) {
			return fmt.Errorf("invalid cosmos transaction hash %s of block %d", t.Hash, t.Height)
		}
	case "evm":
		// ok
		if !utils.IsValidEvmTransactionHash(t.Hash) {
			return fmt.Errorf("invalid evm transaction hash %s of block %d", t.Hash, t.Height)
		}
	default:
		return fmt.Errorf("unrecognised transaction type %s of block %d", t.TxType, t.Height)
	}

	return nil
}
