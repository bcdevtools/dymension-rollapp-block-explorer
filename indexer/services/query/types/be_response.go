package types

import (
	"fmt"
	"github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/utils"
)

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
	LatestBlock             int64             `json:"latestBlock"`
	LatestBlockTimeEpochUTC int64             `json:"latestBlockTimeEpochUTC"`
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

var _ BeJsonRpcResponse = ResponseBeGetLatestBlockNumber{}

// ResponseBeGetLatestBlockNumber is the response for `be_getLatestBlockNumber`
type ResponseBeGetLatestBlockNumber struct {
	LatestBlock             int64 `json:"latestBlock"`
	LatestBlockTimeEpochUTC int64 `json:"latestBlockTimeEpochUTC"`
}

func (r ResponseBeGetLatestBlockNumber) ValidateBasic() error {
	if r.LatestBlock < 1 {
		return fmt.Errorf("missing latest block height information")
	}
	if r.LatestBlockTimeEpochUTC < 1 {
		return fmt.Errorf("missing latest block time information")
	}
	return nil
}

var _ BeJsonRpcResponse = ResponseBeTransactionsInBlockRange{}

// ResponseBeTransactionsInBlockRange is the response for `be_getTransactionsInBlockRange`
type ResponseBeTransactionsInBlockRange struct {
	ChainId       string                                               `json:"chainId"`
	Blocks        map[string]BlockInResponseBeTransactionsInBlockRange `json:"blocks"`
	MissingBlocks []int64                                              `json:"missingBlocks"`
	ErrorBlocks   []int64                                              `json:"errorBlocks"`
}

// TransformedResponseBeTransactionsInBlockRange is ResponseBeTransactionsInBlockRange after transformed
type TransformedResponseBeTransactionsInBlockRange struct {
	Blocks        []BlockInResponseBeTransactionsInBlockRange `json:"blocks"`
	MissingBlocks []int64                                     `json:"missingBlocks"`
	ErrorBlocks   []int64                                     `json:"errorBlocks"`
}

type BlockInResponseBeTransactionsInBlockRange struct {
	Height       int64                                                    `json:"-"` // extracted from key
	TimeEpochUTC int64                                                    `json:"timeEpochUTC"`
	Transactions []TransactionInBlockInResponseBeTransactionsInBlockRange `json:"txs"`
}

type TransactionInBlockInResponseBeTransactionsInBlockRange struct {
	TransactionHash string                                                            `json:"hash"`
	Involvers       InvolversInTransactionInBlockInResponseBeTransactionsInBlockRange `json:"involvers"`
	MessagesType    []string                                                          `json:"messagesType"`
	TransactionType string                                                            `json:"type"`
	EvmTxInfo       *InfoInTransactionInBlockInResponseBeTransactionsInBlockRange     `json:"evmTx,omitempty"`
	WasmTxInfo      *InfoInTransactionInBlockInResponseBeTransactionsInBlockRange     `json:"wasmTx,omitempty"`
}

type InvolversInTransactionInBlockInResponseBeTransactionsInBlockRange struct {
	Signers        []string                                                                  `json:"s,omitempty"`
	Others         []string                                                                  `json:"0,omitempty"`
	Erc20          []string                                                                  `json:"erc20,omitempty"`
	NFT            []string                                                                  `json:"nft,omitempty"`
	TokenContracts ContractInvolversInTransactionInBlockInResponseBeTransactionsInBlockRange `json:"contracts,omitempty"`
}

type InfoInTransactionInBlockInResponseBeTransactionsInBlockRange struct {
	Action          string `json:"action,omitempty"`
	MethodSignature string `json:"sig,omitempty"`
}

type ContractInvolversInTransactionInBlockInResponseBeTransactionsInBlockRange struct {
	Erc20 map[string][]string `json:"erc20,omitempty"`
	NFT   map[string][]string `json:"nft,omitempty"`
}

func (r ResponseBeTransactionsInBlockRange) ValidateBasic() error {
	if len(r.ChainId) < 1 {
		return fmt.Errorf("missing chain-id")
	}
	for _, height := range r.MissingBlocks {
		if height < 1 {
			return fmt.Errorf("missing blocks information contains invalid number %d", height)
		}
	}
	for _, height := range r.ErrorBlocks {
		if height < 1 {
			return fmt.Errorf("error blocks information contains invalid number %d", height)
		}
	}
	for heightStr, block := range r.Blocks {
		if block.TimeEpochUTC < 1 {
			return fmt.Errorf("missing block time information for %s", heightStr)
		}
		for i, tx := range block.Transactions {
			if len(tx.TransactionHash) < 1 {
				return fmt.Errorf("missing transaction hash for tx at %d of block %s", i, heightStr)
			}

			var possibleEvmTxInfo, possibleWasmTxInfo bool
			switch tx.TransactionType {
			case "cosmos":
				// ok
				if !utils.IsValidCosmosTransactionHash(tx.TransactionHash) {
					return fmt.Errorf("invalid cosmos transaction hash %s for tx at %d of block %s", tx.TransactionHash, i, heightStr)
				}
			case "evm":
				// ok
				if !utils.IsValidEvmTransactionHash(tx.TransactionHash) {
					return fmt.Errorf("invalid evm transaction hash %s for tx at %d of block %s", tx.TransactionHash, i, heightStr)
				}
				possibleEvmTxInfo = true
			case "wasm":
				// ok
				if !utils.IsValidCosmosTransactionHash(tx.TransactionHash) {
					return fmt.Errorf("invalid wasm transaction hash %s for tx at %d of block %s", tx.TransactionHash, i, heightStr)
				}
				possibleWasmTxInfo = true
			default:
				return fmt.Errorf("unrecognised transaction type %s for tx at %d of block %s", tx.TransactionType, i, heightStr)
			}
			if len(tx.MessagesType) < 1 {
				return fmt.Errorf("missing messages type for tx at %d of block %s", i, heightStr)
			}

			if !possibleEvmTxInfo && tx.EvmTxInfo != nil {
				return fmt.Errorf("unexpected evm tx info for tx at %d of block %s", i, heightStr)
			}
			if !possibleWasmTxInfo && tx.WasmTxInfo != nil {
				return fmt.Errorf("unexpected wasm tx info for tx at %d of block %s", i, heightStr)
			}
		}
	}
	return nil
}

func (m *InfoInTransactionInBlockInResponseBeTransactionsInBlockRange) String() string {
	if m == nil {
		return ""
	}

	if m.Action == "" {
		return ""
	}

	if m.MethodSignature == "" {
		return m.Action
	}

	return fmt.Sprintf("%s|%s", m.Action, m.MethodSignature)
}
