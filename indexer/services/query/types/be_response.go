package types

import (
	"fmt"
	"github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/constants"
	"github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/utils"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/pkg/errors"
	"time"
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
	Value           string                                                            `json:"value,omitempty"`
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

	nowUTC := time.Now().UTC().Unix()
	malformedTimeEpochUTCIsGreaterThan := nowUTC + constants.RpcTxAheadBlockTimeAllowed

	for heightStr, block := range r.Blocks {
		if block.TimeEpochUTC < 1 {
			return fmt.Errorf("missing block time information [%s]", heightStr)
		}
		if block.TimeEpochUTC > malformedTimeEpochUTCIsGreaterThan {
			// this condition is used to prevent spamming
			return errors.Wrapf(ErrBlackListDueToMalformedResponse, "bad block time %d, now %d [%s]", block.TimeEpochUTC, nowUTC, heightStr)
		}
		if countTxs := len(block.Transactions); countTxs > constants.RpcTxMaximumTxsPerBlockAllowed {
			return errors.Wrapf(ErrBlackListDueToMalformedResponse, "too many txs %d, maximum allowed %d [%s]", countTxs, constants.RpcTxMaximumTxsPerBlockAllowed, heightStr)
		}
		for i, tx := range block.Transactions {
			if len(tx.TransactionHash) < 1 {
				return fmt.Errorf("missing transaction hash for tx at %d [%s]", i, heightStr)
			}

			var possibleEvmTxInfo, possibleWasmTxInfo bool
			switch tx.TransactionType {
			case "cosmos":
				// ok
				if !utils.IsValidCosmosTransactionHash(tx.TransactionHash) {
					return fmt.Errorf("invalid cosmos transaction hash %s for tx at %d [%s]", tx.TransactionHash, i, heightStr)
				}
			case "evm":
				// ok
				if !utils.IsValidEvmTransactionHash(tx.TransactionHash) {
					return fmt.Errorf("invalid evm transaction hash %s for tx at %d [%s]", tx.TransactionHash, i, heightStr)
				}
				possibleEvmTxInfo = true
			case "wasm":
				// ok
				if !utils.IsValidCosmosTransactionHash(tx.TransactionHash) {
					return fmt.Errorf("invalid wasm transaction hash %s for tx at %d [%s]", tx.TransactionHash, i, heightStr)
				}
				possibleWasmTxInfo = true
			default:
				return fmt.Errorf("unrecognised transaction type %s for tx at %d [%s]", tx.TransactionType, i, heightStr)
			}

			ivs := tx.Involvers
			if countSigners := len(ivs.Signers); countSigners > constants.RpcTxMaximumSignersPerTx {
				return errors.Wrapf(ErrBlackListDueToMalformedResponse, "too many signers per tx %d, maximum allowed %d [%s]", countSigners, constants.RpcTxMaximumSignersPerTx, heightStr)
			}
			for _, signer := range ivs.Signers {
				if lenSignerAddr := len(signer); lenSignerAddr > constants.RpcTxMaximumLengthAddressAllowed {
					return errors.Wrapf(ErrBlackListDueToMalformedResponse, "signer address too big %d, maximum allowed %d [%s]", lenSignerAddr, constants.RpcTxMaximumLengthAddressAllowed, heightStr)
				}
			}
			if countInvolvers := len(ivs.Others); countInvolvers > constants.RpcTxMaximumInvolversPerTxAllowed {
				return errors.Wrapf(ErrBlackListDueToMalformedResponse, "too many involvers Others per tx %d, maximum allowed %d [%s]", countInvolvers, constants.RpcTxMaximumInvolversPerTxAllowed, heightStr)
			}
			for _, signer := range ivs.Signers {
				if lenSignerAddr := len(signer); lenSignerAddr > constants.RpcTxMaximumLengthAddressAllowed {
					return errors.Wrapf(ErrBlackListDueToMalformedResponse, "signer address too big %d, maximum allowed %d [%s]", lenSignerAddr, constants.RpcTxMaximumLengthAddressAllowed, heightStr)
				}
			}
			if countInvolvers := len(ivs.Erc20); countInvolvers > constants.RpcTxMaximumInvolversPerTxAllowed {
				return errors.Wrapf(ErrBlackListDueToMalformedResponse, "too many involvers ERC-20 per tx %d, maximum allowed %d [%s]", countInvolvers, constants.RpcTxMaximumInvolversPerTxAllowed, heightStr)
			}
			for _, erc20 := range ivs.Erc20 {
				if lenErc20Addr := len(erc20); lenErc20Addr > constants.RpcTxMaximumLengthAddressAllowed {
					return errors.Wrapf(ErrBlackListDueToMalformedResponse, "ERC-20 address too big %d, maximum allowed %d [%s]", lenErc20Addr, constants.RpcTxMaximumLengthAddressAllowed, heightStr)
				}
			}
			if countInvolvers := len(ivs.NFT); countInvolvers > constants.RpcTxMaximumInvolversPerTxAllowed {
				return errors.Wrapf(ErrBlackListDueToMalformedResponse, "too many involvers NFT per tx %d, maximum allowed %d [%s]", countInvolvers, constants.RpcTxMaximumInvolversPerTxAllowed, heightStr)
			}
			for _, nft := range ivs.NFT {
				if lenNftAddr := len(nft); lenNftAddr > constants.RpcTxMaximumLengthAddressAllowed {
					return errors.Wrapf(ErrBlackListDueToMalformedResponse, "NFT address too big %d, maximum allowed %d [%s]", lenNftAddr, constants.RpcTxMaximumLengthAddressAllowed, heightStr)
				}
			}

			ivsTC := ivs.TokenContracts
			if lenTcErc20 := len(ivsTC.Erc20); lenTcErc20 > constants.RpcTxMaximumTokenContractsInvolvesPerTxAllowed {
				return errors.Wrapf(ErrBlackListDueToMalformedResponse, "too many involvers ERC-20 token contract per tx %d, maximum allowed %d [%s]", lenTcErc20, constants.RpcTxMaximumTokenContractsInvolvesPerTxAllowed, heightStr)
			}
			for erc20Contract, involvers := range ivsTC.Erc20 {
				if lenErc20Addr := len(erc20Contract); lenErc20Addr > constants.RpcTxMaximumLengthAddressAllowed {
					return errors.Wrapf(ErrBlackListDueToMalformedResponse, "ERC-20 contract address too big %d, maximum allowed %d [%s]", lenErc20Addr, constants.RpcTxMaximumLengthAddressAllowed, heightStr)
				}
				if countInvolvers := len(involvers); countInvolvers > constants.RpcTxMaximumInvolversPerTxAllowed {
					return errors.Wrapf(ErrBlackListDueToMalformedResponse, "too many involvers ERC-20 token contract addresses per tx %d, maximum allowed %d [%s]", countInvolvers, constants.RpcTxMaximumInvolversPerTxAllowed, heightStr)
				}
				for _, addr := range involvers {
					if lenAddr := len(addr); lenAddr > constants.RpcTxMaximumLengthAddressAllowed {
						return errors.Wrapf(ErrBlackListDueToMalformedResponse, "ERC-20 token contract involver address too big %d, maximum allowed %d [%s]", lenAddr, constants.RpcTxMaximumLengthAddressAllowed, heightStr)
					}
				}
			}
			if lenTcNft := len(ivsTC.NFT); lenTcNft > constants.RpcTxMaximumTokenContractsInvolvesPerTxAllowed {
				return errors.Wrapf(ErrBlackListDueToMalformedResponse, "too many involvers NFT token contract per tx %d, maximum allowed %d [%s]", lenTcNft, constants.RpcTxMaximumTokenContractsInvolvesPerTxAllowed, heightStr)
			}
			for nftContract, involvers := range ivsTC.NFT {
				if lenNftAddr := len(nftContract); lenNftAddr > constants.RpcTxMaximumLengthAddressAllowed {
					return errors.Wrapf(ErrBlackListDueToMalformedResponse, "NFT contract address too big %d, maximum allowed %d [%s]", lenNftAddr, constants.RpcTxMaximumLengthAddressAllowed, heightStr)
				}
				if countInvolvers := len(involvers); countInvolvers > constants.RpcTxMaximumInvolversPerTxAllowed {
					return errors.Wrapf(ErrBlackListDueToMalformedResponse, "too many involvers NFT token contract addresses per tx %d, maximum allowed %d [%s]", countInvolvers, constants.RpcTxMaximumInvolversPerTxAllowed, heightStr)
				}
				for _, addr := range involvers {
					if lenAddr := len(addr); lenAddr > constants.RpcTxMaximumLengthAddressAllowed {
						return errors.Wrapf(ErrBlackListDueToMalformedResponse, "NFT token contract involver address too big %d, maximum allowed %d [%s]", lenAddr, constants.RpcTxMaximumLengthAddressAllowed, heightStr)
					}
				}
			}

			if len(tx.MessagesType) < 1 {
				return fmt.Errorf("missing messages type for tx at %d [%s]", i, heightStr)
			}
			if countMsgs := len(tx.MessagesType); countMsgs > constants.RpcTxMaximumMessagesPerTxAllowed {
				return errors.Wrapf(ErrBlackListDueToMalformedResponse, "too many messages per tx %d, maximum allowed %d [%s]", countMsgs, constants.RpcTxMaximumMessagesPerTxAllowed, heightStr)
			}
			for _, msgType := range tx.MessagesType {
				if msgType == "" {
					return fmt.Errorf("message type can not be empty")
				}
				if lenMsgType := len(msgType); lenMsgType > constants.RpcTxMaximumStringSizeAllowed {
					return errors.Wrapf(ErrBlackListDueToMalformedResponse, "message type is too long %d, maximum allowed %d [%s]", lenMsgType, constants.RpcTxMaximumStringSizeAllowed, heightStr)
				}
			}

			if !possibleEvmTxInfo && tx.EvmTxInfo != nil {
				return fmt.Errorf("unexpected evm tx info for tx at %d [%s]", i, heightStr)
			}
			if !possibleWasmTxInfo && tx.WasmTxInfo != nil {
				return fmt.Errorf("unexpected wasm tx info for tx at %d [%s]", i, heightStr)
			}

			if tx.EvmTxInfo != nil {
				const evmTxActionMaxSize = 66
				const evmTxMethodSigMaxSize = 10
				if lenActionEvmTxInfo := len(tx.EvmTxInfo.Action); lenActionEvmTxInfo > evmTxActionMaxSize {
					return errors.Wrapf(ErrBlackListDueToMalformedResponse, "evm tx action size is too long %d, maximum allowed %d [%s]", lenActionEvmTxInfo, evmTxActionMaxSize, heightStr)
				}
				if lenSigEvmTxInfo := len(tx.EvmTxInfo.MethodSignature); lenSigEvmTxInfo > evmTxMethodSigMaxSize {
					return errors.Wrapf(ErrBlackListDueToMalformedResponse, "evm tx method signature size is too long %d, maximum allowed %d [%s]", lenSigEvmTxInfo, evmTxMethodSigMaxSize, heightStr)
				}
			}
			if tx.WasmTxInfo != nil {
				const wasmTxActionMaxSize = 200
				const wasmTxMethodSigMaxSize = 200
				if lenActionWasmTxInfo := len(tx.WasmTxInfo.Action); lenActionWasmTxInfo > wasmTxActionMaxSize {
					return errors.Wrapf(ErrBlackListDueToMalformedResponse, "wasm tx action size is too long %d, maximum allowed %d [%s]", lenActionWasmTxInfo, wasmTxActionMaxSize, heightStr)
				}
				if lenSigWasmTxInfo := len(tx.WasmTxInfo.MethodSignature); lenSigWasmTxInfo > wasmTxMethodSigMaxSize {
					return errors.Wrapf(ErrBlackListDueToMalformedResponse, "wasm tx method signature size is too long %d, maximum allowed %d [%s]", lenSigWasmTxInfo, wasmTxMethodSigMaxSize, heightStr)
				}
			}

			if valueLen := len(tx.Value); valueLen > 0 {
				if valueLen > constants.RpcTxMaximumStringSizeAllowed {
					return errors.Wrapf(ErrBlackListDueToMalformedResponse, "value size is too long %d, maximum allowed %d [%s]", valueLen, constants.RpcTxMaximumStringSizeAllowed, heightStr)
				}
				if _, parseErr := sdk.ParseCoinsNormalized(tx.Value); parseErr != nil {
					return errors.Wrap(parseErr, "failed to parse tx value")
				}
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
