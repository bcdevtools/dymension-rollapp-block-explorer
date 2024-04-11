package per_chain_indexer

import (
	"context"
	"fmt"
	libapp "github.com/EscanBE/go-lib/app"
	libutils "github.com/EscanBE/go-lib/utils"
	"github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/constants"
	"github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/database"
	dbtypes "github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/database/types"
	pcitypes "github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/services/per_chain_indexer/types"
	querysvc "github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/services/query"
	querytypes "github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/services/query/types"
	"github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/types"
	"github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/utils"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/ethereum/go-ethereum/common"
	"github.com/pkg/errors"
	"slices"
	"sync"
	"time"
)

type Indexer interface {
	// Start triggers start indexing on-chain data
	Start()

	// Reload update the external provided chain configuration.
	Reload(types.ChainConfig) error

	// Shutdown tells the indexer to start shutdown process.
	Shutdown()
}

var _ Indexer = &defaultIndexer{}

type defaultIndexer struct {
	sync.RWMutex

	ctx         context.Context
	indexingCfg types.Indexing

	chainName        string
	chainConfig      types.ChainConfig
	querySvc         querysvc.BeJsonRpcQueryService
	activeJsonRpcUrl string

	started      bool // flag to indicate indexer first started indexing or not
	shutdown     bool // flag to indicate indexer should not continue to do it's work
	lastUrlCheck time.Time

	sharedCache pcitypes.SharedCache
}

func NewIndexer(
	ctx context.Context,
	chainName string,
	chainConfig types.ChainConfig,
	sharedCache pcitypes.SharedCache,
) Indexer {
	indexingConfig := types.UnwrapIndexerContext(ctx).GetConfig().IndexingConfig
	return &defaultIndexer{
		ctx:         ctx,
		indexingCfg: indexingConfig,
		chainName:   chainName,
		chainConfig: chainConfig,
		querySvc:    querysvc.NewBeJsonRpcQueryService(chainConfig.ChainId),

		sharedCache: sharedCache,
	}
}

func (d *defaultIndexer) Start() {
	indexerCtx := types.UnwrapIndexerContext(d.ctx)
	logger := indexerCtx.GetLogger()
	db := indexerCtx.GetDatabase()

	defer libapp.TryRecoverAndExecuteExitFunctionIfRecovered(logger)

	logger.Debug("Starting indexer", "chain", d.chainName)

	d.ensureNotStartedWithRLock()

	// prepare partitioned tables
	for {
		err := utils.ObserveLongOperation("create partitioned tables for chain-id", func() error {
			return db.PreparePartitionedTablesForChainId(d.chainConfig.ChainId)
		}, 15*time.Second, logger)
		if err != nil {
			logger.Error("failed to create partitioned tables for chain-id, retrying...", "chain-id", d.chainConfig.ChainId, "error", err.Error())
			time.Sleep(15 * time.Second)
			continue
		}

		logger.Info("successfully prepared partitioned tables for chain-id", "chain-id", d.chainConfig.ChainId)
		break
	}

	// prepare chain info record
	for !d.isShuttingDownWithRLock() {
		time.Sleep(5 * time.Second)

		err := d.genericLoop(func(beGetChainInfo *querytypes.ResponseBeGetChainInfo) error {
			activeJsonRpcUrl, _ := d.getActiveJsonRpcUrlAndLastCheck()

			record, err := dbtypes.NewRecordChainInfoForInsert(
				beGetChainInfo.ChainId,
				d.chainName,
				beGetChainInfo.ChainType,
				beGetChainInfo.Bech32,
				beGetChainInfo.Denom,
				activeJsonRpcUrl,
			)
			if err == nil {
				_, err = db.InsertOrUpdateRecordChainInfo(record)
			}
			return err
		})

		if err != nil {
			logger.Error("failed to insert/update chain info record", "chain-id", d.chainConfig.ChainId, "error", err.Error())
			continue
		}

		// success
		break
	}

	var bech32Cfg dbtypes.Bech32PrefixOfChainInfo
	for !d.isShuttingDownWithRLock() {
		time.Sleep(10 * time.Second)

		var err error
		bech32Cfg, err = db.GetBech32Config(d.chainConfig.ChainId)
		if err != nil {
			logger.Error("failed to get bech32 config", "chain-id", d.chainConfig.ChainId, "error", err.Error())
			continue
		}

		break
	}

	if err := bech32Cfg.ValidateBasic(); err != nil {
		panic(err)
	}

	var catchUp bool // catch-up mode, lower the interval

	for !d.isShuttingDownWithRLock() {
		if catchUp {
			time.Sleep(500 * time.Millisecond)
		} else {
			time.Sleep(d.indexingCfg.IndexBlockInterval)
		}

		_ = d.genericLoop(func(beGetChainInfo *querytypes.ResponseBeGetChainInfo) error {
			catchUp = false

			// perform indexing
			latestIndexedBlock, err := db.GetLatestIndexedBlock(d.chainConfig.ChainId)
			if err != nil {
				logger.Error("failed to get latest indexed block from database", "chain-id", d.chainConfig.ChainId, "error", err.Error())
				return err
			}

			upstreamRpcLatestBlock := beGetChainInfo.LatestBlock

			// Sometime, the upstream RPC is restored with snapshot, thus causing the latest block to be behind.
			// We are going to force renew upstream RPC URL.
			// But to get rid of unnecessary force renew operation,
			// we can tolerate this by setting a maximum number of outdated blocks accepted.
			const maximumNumberOfOutdatedBlocksAccepted = 3

			if upstreamRpcLatestBlock < latestIndexedBlock-maximumNumberOfOutdatedBlocksAccepted {
				// fall too much behind, force renew upstream RPC URL

				logger.Info(
					"upstream latest block is behind, force renew upstream RPC URL",
					"chain-id", d.chainConfig.ChainId,
					"upstream-latest-block", upstreamRpcLatestBlock,
					"indexed-latest-block", latestIndexedBlock,
					"out-dated URL", d.querySvc.GetQueryEndpoint(),
				)
				d.forceResetActiveJsonRpcUrl(true)
				return nil
			}

			if upstreamRpcLatestBlock <= latestIndexedBlock {
				// no new block to index
				return nil
			}

			nextBlockToIndexFrom := latestIndexedBlock + 1
			nextBlockToIndexTo := libutils.MinInt64(
				upstreamRpcLatestBlock,
				nextBlockToIndexFrom+constants.MaximumNumberOfBlocksToIndexPerBatch-1,
			)

			beTransactionsInBlockRange, _, err := d.querySvc.BeTransactionsInBlockRange(nextBlockToIndexFrom, nextBlockToIndexTo)
			if err != nil {
				if querytypes.IsErrBlackList(err) {
					d.forceResetActiveJsonRpcUrl(true)
					logger.Error("malformed response", "chain-id", d.chainConfig.ChainId, "endpoint", "be_getTransactionsInBlockRange", "error", err.Error())
				} else {
					logger.Error("failed to get transactions in block range, waiting for next round", "chain-id", d.chainConfig.ChainId, "error", err.Error())
				}
				return err
			}

			for _, errorBlock := range beTransactionsInBlockRange.ErrorBlocks {
				err = db.InsertOrUpdateFailedBlock(d.chainConfig.ChainId, errorBlock, fmt.Errorf("rpc marks error"))
				if err != nil {
					logger.Error("failed to insert/update failed block", "chain-id", d.chainConfig.ChainId, "height", errorBlock, "error", err.Error())
					return err
				}
			}

			for _, missingBlock := range beTransactionsInBlockRange.MissingBlocks {
				err = db.InsertOrUpdateFailedBlock(d.chainConfig.ChainId, missingBlock, fmt.Errorf("rpc marks missing"))
				if err != nil {
					logger.Error("failed to insert/update failed block", "chain-id", d.chainConfig.ChainId, "height", missingBlock, "error", err.Error())
					return err
				}
			}

			if len(beTransactionsInBlockRange.Blocks) > 0 {
				// sort ascending
				slices.SortFunc(beTransactionsInBlockRange.Blocks, func(l, r querytypes.BlockInResponseBeTransactionsInBlockRange) int {
					return int(l.Height - r.Height)
				})
			}

			for _, block := range beTransactionsInBlockRange.Blocks {
				blockHeight := block.Height

				if blockHeight == 0 { // unexpected un-set value
					panic(fmt.Sprintf("unexpected block height 0 when indexing %s", d.chainConfig.ChainId))
				}

				if len(block.Transactions) < 1 {
					// skip empty block
					err = db.SetLatestIndexedBlock(d.chainConfig.ChainId, blockHeight)
					if err != nil {
						logger.Error("failed to set latest indexed block", "chain-id", d.chainConfig.ChainId, "height", blockHeight, "error", err.Error(), "tx", false)
					}
					continue
				}

				epochWeek := utils.GetEpochWeek(block.TimeEpochUTC)
				if !d.sharedCache.IsCreatedPartitionsForEpochWeek(epochWeek) {
					// prepare partitioned tables for this epoch week
					err := utils.ObserveLongOperation("create partitioned tables for epoch week", func() error {
						return db.PreparePartitionedTablesForEpoch(block.TimeEpochUTC)
					}, 15*time.Second, logger)
					if err != nil {
						logger.Error("failed to create partitioned tables for epoch, retrying...", "chain-id", d.chainConfig.ChainId, "error", err.Error())
						time.Sleep(15 * time.Second)
						return errors.Wrap(err, fmt.Sprintf("failed to create partitioned tables for epoch week: %d", epochWeek))
					}

					logger.Info("successfully prepared partitioned tables for epoch week", "epoch-week", epochWeek)
					d.sharedCache.MarkCreatedPartitionsForEpochWeek(epochWeek)
				}

				dbTx, err := db.BeginDatabaseTransaction(context.Background())
				if err != nil {
					logger.Error("failed to begin transaction", "error", err.Error())
					return err
				}

				err = d.insertBlockInformation(blockHeight, block, bech32Cfg, dbTx)
				if err != nil {
					logger.Error("failed to insert block information", "chain-id", d.chainConfig.ChainId, "height", blockHeight, "error", err.Error())
				}

				if err == nil && len(block.Transactions) > 0 {
					err = dbTx.CleanupZeroRefCountRecentAccountTransaction()
					if err != nil {
						logger.Error("failed to cleanup zero ref count recent account transaction", "chain-id", d.chainConfig.ChainId, "height", blockHeight, "error", err.Error())
					}
				}

				if err == nil {
					err = dbTx.SetLatestIndexedBlock(d.chainConfig.ChainId, blockHeight)
					if err != nil {
						logger.Error("failed to set latest indexed block", "chain-id", d.chainConfig.ChainId, "height", blockHeight, "error", err.Error(), "tx", true)
					}
				}

				if err == nil {
					err = dbTx.RemoveFailedBlockRecord(d.chainConfig.ChainId, blockHeight)
					if err != nil {
						logger.Error("failed to remove failed block record", "chain-id", d.chainConfig.ChainId, "height", blockHeight, "error", err.Error())
					}
				}

				if err != nil {
					logger.Error("failed to insert block information, rollback", "error", err.Error(), "chain-id", d.chainConfig.ChainId, "height", blockHeight)
					_ = dbTx.RollbackTransaction()
					_ = db.InsertOrUpdateFailedBlock(d.chainConfig.ChainId, blockHeight, err)
					continue
				}

				err = dbTx.CommitTransaction()
				if err != nil {
					logger.Error("failed to commit block information", "error", err.Error(), "chain-id", d.chainConfig.ChainId, "height", blockHeight)
					_ = db.InsertOrUpdateFailedBlock(d.chainConfig.ChainId, blockHeight, err)
					continue
				}

				logger.Debug("indexed block successfully", "chain-id", d.chainConfig.ChainId, "height", blockHeight)
			}

			if nextBlockToIndexTo < upstreamRpcLatestBlock {
				catchUp = true
			}

			return nil
		})
	}

	logger.Info("shutting down indexer", "name", d.chainName)
}

func (d *defaultIndexer) insertBlockInformation(height int64, block querytypes.BlockInResponseBeTransactionsInBlockRange, bech32Cfg dbtypes.Bech32PrefixOfChainInfo, dbTx database.DbTransaction) error {
	var recordsTxs dbtypes.RecordsTransaction
	mapInvolvedAccounts := make(map[string]dbtypes.RecordAccount)
	var recentAccountTxs dbtypes.RecordsRecentAccountTransaction
	var refAccountToRecentTxs dbtypes.RecordsRefAccountToRecentTx

	for _, transaction := range block.Transactions {
		// build transaction record

		recordTx := dbtypes.NewRecordTransactionForInsert(
			d.chainConfig.ChainId,
			height,
			transaction.TransactionHash,
			block.TimeEpochUTC,
			transaction.MessagesType,
			transaction.TransactionType,
		)

		recordsTxs = append(recordsTxs, recordTx)

		// build involved accounts record & recent tx for accounts

		var anyInvolvedAccount bool

		if len(transaction.Involvers) > 0 {
			type structInvolvedFlag struct {
				Signer bool
				Erc20  bool
				NFT    bool
			}
			mapBech32ToInvolvedFlag := make(map[string]structInvolvedFlag)

			for involvedType, involvers := range transaction.Involvers {
				for _, involver := range involvers {
					absolutelyInvalidAddress, bech32Address, err := unsafeAnyAddressToBech32Address(involver, bech32Cfg)
					if err != nil {
						return errors.Wrapf(err, "failed to convert involver address %s to bech32 address", involver)
					}

					if absolutelyInvalidAddress {
						// ignore invalid records
						continue
					}

					var involvedAccount dbtypes.RecordAccount
					var found bool

					if involvedAccount, found = mapInvolvedAccounts[bech32Address]; !found {
						involvedAccount = dbtypes.NewRecordAccountForInsert(
							d.chainConfig.ChainId,
							bech32Address,
						)
					}

					mapInvolvedAccounts[bech32Address] = involvedAccount

					anyInvolvedAccount = true

					sif, existing := mapBech32ToInvolvedFlag[bech32Address]
					if !existing {
						sif = structInvolvedFlag{}
					}
					switch involvedType {
					case constants.InvolversTypeSenderOrSigner:
						sif.Signer = true
					case constants.InvolversTypeErc20:
						sif.Erc20 = true
					case constants.InvolversTypeNft:
						sif.NFT = true
					}
					mapBech32ToInvolvedFlag[bech32Address] = sif
				}
			}

			if len(mapBech32ToInvolvedFlag) > 0 {
				for bech32Address, involvedFlag := range mapBech32ToInvolvedFlag {
					ref := dbtypes.NewRecordRefAccountToRecentTxForInsert(
						d.chainConfig.ChainId,
						bech32Address,
						height,
						transaction.TransactionHash,
					)
					ref.Signer = involvedFlag.Signer
					ref.Erc20 = involvedFlag.Erc20
					ref.NFT = involvedFlag.NFT
					refAccountToRecentTxs = append(refAccountToRecentTxs, ref)
				}
			}
		}

		if anyInvolvedAccount {
			recentAccountTxs = append(
				recentAccountTxs,
				dbtypes.NewRecordRecentAccountTransactionForInsert(
					d.chainConfig.ChainId,
					height,
					transaction.TransactionHash,
					block.TimeEpochUTC,
					transaction.MessagesType,
				),
			)
		}
	}

	err := dbTx.InsertRecordTransactionsIfNotExists(recordsTxs)
	if err != nil {
		return errors.Wrap(err, "failed to insert transactions")
	}

	var involvedAccounts dbtypes.RecordsAccount
	for _, recordAccount := range mapInvolvedAccounts {
		involvedAccounts = append(involvedAccounts, recordAccount)
	}

	err = dbTx.InsertOrUpdateRecordsAccount(involvedAccounts)
	if err != nil {
		return errors.Wrap(err, "failed to insert/update involved accounts")
	}

	err = dbTx.InsertRecordsRecentAccountTransactionIfNotExists(recentAccountTxs)
	if err != nil {
		return errors.Wrap(err, "failed to insert recent account transactions")
	}

	err = dbTx.InsertRecordsRefAccountToRecentTxIfNotExists(refAccountToRecentTxs)
	if err != nil {
		return errors.Wrap(err, "failed to insert ref account to recent tx")
	}

	return nil
}

// genericLoop will handle refresh active json rpc url, and perform the provided function.
func (d *defaultIndexer) genericLoop(f func(*querytypes.ResponseBeGetChainInfo) error) (err error) {
	indexerCtx := types.UnwrapIndexerContext(d.ctx)
	logger := indexerCtx.GetLogger()

	// check if active json rpc url is still valid, and use the most up-to-date, the fastest one
	_, beGetChainInfo := d.refreshActiveJsonRpcUrl()

	activeJsonRpcUrl, _ := d.getActiveJsonRpcUrlAndLastCheck()
	// if no active json rpc url at this point, skip indexing
	if len(activeJsonRpcUrl) == 0 {
		logger.Error("no active json-rpc url, skip this round", "chain-id", d.chainConfig.ChainId)
		d.forceResetActiveJsonRpcUrl(true)
		time.Sleep(15 * time.Second)
		return fmt.Errorf("no active json-rpc url")
	}

	// use the active url
	d.querySvc.SetQueryEndpoint(activeJsonRpcUrl)

	if beGetChainInfo == nil {
		beGetChainInfo, _, err = d.querySvc.BeGetChainInfo()
		if err != nil {
			logger.Error("failed to get chain info, waiting for next round", "chain-id", d.chainConfig.ChainId, "error", err.Error())
			return err
		}
	}

	// validate chain info
	// Even tho the validation was performed earlier, it's better to double-check and provide more context
	if beGetChainInfo.ChainId != d.chainConfig.ChainId {
		logger.Error("chain-id mismatch", "expected", d.chainConfig.ChainId, "got", beGetChainInfo.ChainId)
		d.forceResetActiveJsonRpcUrl(true)
		return fmt.Errorf("chain-id mismatch")
	}

	return f(beGetChainInfo)
}

func (d *defaultIndexer) Reload(chainConfig types.ChainConfig) error {
	d.Lock()
	defer d.Unlock()

	if chainConfig.ChainId != d.chainConfig.ChainId {
		return fmt.Errorf("mis-match chain-id, expected %s, got new %s", d.chainConfig.ChainId, chainConfig.ChainId)
	}

	if !utils.AreSortedStringArraysEquals(d.chainConfig.BeJsonRpcUrls, chainConfig.BeJsonRpcUrls) {
		// urls changed, force health-check URLs
		d.forceResetActiveJsonRpcUrl(false)
	}

	d.chainConfig = chainConfig
	return nil
}

func (d *defaultIndexer) Shutdown() {
	d.Lock()
	defer d.Unlock()

	d.shutdown = true
}

// ensureNotStartedWithRLock panics if the indexer has already started.
func (d *defaultIndexer) ensureNotStartedWithRLock() {
	d.RLock()
	defer d.RUnlock()

	if d.started {
		panic(fmt.Sprintf("indexer for %s has already started", d.chainName))
	}
}

// isShuttingDownWithRLock returns true of the indexer is flagged as in shutting down state.
func (d *defaultIndexer) isShuttingDownWithRLock() bool {
	d.RLock()
	defer d.RUnlock()

	return d.shutdown
}

// unsafeAnyAddressToBech32Address tries to convert 0x address to bech32 address.
// If the address is not an EVM address, starts with bech32 prefix, it will return the original address.
func unsafeAnyAddressToBech32Address(involver string, bech32Cfg dbtypes.Bech32PrefixOfChainInfo) (absolutelyInvalid bool, unsafeBech32Address string, err error) {
	normalizedAddress := utils.NormalizeAddress(involver)
	if utils.IsEvmAddress(normalizedAddress) {
		evmAddr := common.HexToAddress(normalizedAddress)
		bech32Address, errBech32ify := sdk.Bech32ifyAddressBytes(bech32Cfg.Bech32PrefixAccAddr, evmAddr.Bytes())
		if errBech32ify != nil {
			err = errors.Wrapf(err, "failed to bech32ify address %s", normalizedAddress)
			return
		}
		unsafeBech32Address = utils.NormalizeAddress(bech32Address)
		return
	}

	if _, possibleBech32Addr := utils.UnsafeExtractBech32Hrp(normalizedAddress); possibleBech32Addr {
		// ok
		unsafeBech32Address = normalizedAddress
		return
	}

	absolutelyInvalid = true
	return
}
