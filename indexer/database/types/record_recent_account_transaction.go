package types

import (
	"fmt"
	"github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/utils"
	"strings"
)

type RecordsRecentAccountTransaction []RecordRecentAccountTransaction

// RecordRecentAccountTransaction represents a record of table `recent_account_transaction` in the database.
type RecordRecentAccountTransaction struct {
	ChainId  string
	Height   int64
	Hash     string
	RefCount int16

	Epoch        int64
	MessageTypes []string
}

// NewRecordRecentAccountTransactionForInsert procedures a new RecordRecentAccountTransaction for insertion into database
func NewRecordRecentAccountTransactionForInsert(
	chainId string,
	height int64,
	hash string,

	epoch int64,
	messageTypes []string,
) RecordRecentAccountTransaction {
	return RecordRecentAccountTransaction{
		ChainId:      utils.NormalizeChainId(chainId),
		Height:       height,
		Hash:         hash,
		RefCount:     0,
		Epoch:        epoch,
		MessageTypes: messageTypes,
	}
}

func (t RecordsRecentAccountTransaction) ValidateBasic() error {
	var theOnlyChainId string
	var theOnlyBlockHeight int64
	uniqueHashTracker := make(map[string]bool)
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

		upperHashForUniqueChecking := strings.ToUpper(tx.Hash)
		if _, found := uniqueHashTracker[upperHashForUniqueChecking]; found {
			return fmt.Errorf("duplicate transaction hash %s of block %d", tx.Hash, tx.Height)
		} else {
			uniqueHashTracker[upperHashForUniqueChecking] = true
		}

		if err := tx.ValidateBasic(); err != nil {
			return err
		}
	}

	return nil
}

func (t RecordRecentAccountTransaction) ValidateBasic() error {
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

	if !utils.IsValidCosmosTransactionHash(t.Hash) && !utils.IsValidEvmTransactionHash(t.Hash) {
		return fmt.Errorf("invalid transaction hash %s of block %d, neither Cosmos nor EVM format", t.Hash, t.Height)
	}

	if t.Epoch < 1 {
		return fmt.Errorf("epoch must be possitive, got %d", t.Epoch)
	}

	if len(t.MessageTypes) < 1 {
		return fmt.Errorf("message types cannot be empty")
	}

	return nil
}
