package per_chain_indexer

//goland:noinspection SpellCheckingInspection
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
	chainId          string
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
		chainId:     chainConfig.ChainId,
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

	// check if chain is postponed then stop indexing
	for {
		isPostponedChain, err := db.IsChainPostponed(d.chainId)
		if err != nil {
			logger.Error("failed to check if chain is postponed", "chain-id", d.chainId, "error", err.Error())
			time.Sleep(15 * time.Second)
			continue
		}

		if isPostponedChain {
			logger.Info("chain is postponed, skip indexing", "chain-id", d.chainId)
			time.Sleep(constants.RecheckPostponedChainInterval)
			// sleep for few minutes before checking again
			continue
		}

		break
	}

	logger.Debug("Starting indexer", "chain", d.chainName)

	d.ensureNotStartedWithRLock()

	// prepare partitioned tables
	for {
		err := utils.ObserveLongOperation("create partitioned tables for chain-id", func() error {
			return db.PreparePartitionedTablesForChainId(d.chainId)
		}, 15*time.Second, logger)
		if err != nil {
			logger.Error("failed to create partitioned tables for chain-id, retrying...", "chain-id", d.chainId, "error", err.Error())
			time.Sleep(15 * time.Second)
			continue
		}

		logger.Info("successfully prepared partitioned tables for chain-id", "chain-id", d.chainId)
		break
	}

	// prepare chain info record
	for !d.isShuttingDownWithRLock() {
		time.Sleep(5 * time.Second)

		err := d.genericLoop(func(beGetChainInfo querytypes.ResponseBeGetChainInfo) error {
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
			logger.Error("failed to insert/update chain info record", "chain-id", d.chainId, "error", err.Error())
			continue
		}

		// success
		break
	}

	var bech32Cfg dbtypes.Bech32PrefixOfChainInfo
	for !d.isShuttingDownWithRLock() {
		time.Sleep(10 * time.Second)

		var err error
		bech32Cfg, err = db.GetBech32Config(d.chainId)
		if err != nil {
			logger.Error("failed to get bech32 config", "chain-id", d.chainId, "error", err.Error())
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
			time.Sleep(100 * time.Millisecond)
		} else {
			time.Sleep(d.indexingCfg.IndexBlockInterval)
		}

		_ = d.genericLoop(func(beGetChainInfo querytypes.ResponseBeGetChainInfo) error {
			catchUp = false

			// perform indexing
			latestIndexedBlock, isPostponedChain, err := db.GetLatestIndexedBlock(d.chainId)
			if err != nil {
				logger.Error("failed to get latest indexed block from database", "chain-id", d.chainId, "error", err.Error())
				return err
			}
			if isPostponedChain {
				logger.Info("chain is postponed, skip indexing", "chain-id", d.chainId)
				time.Sleep(constants.RecheckPostponedChainInterval)
				// sleep for few minutes before checking again
				return nil
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
					"chain-id", d.chainId,
					"upstream-latest-block", upstreamRpcLatestBlock,
					"indexed-latest-block", latestIndexedBlock,
					"out-dated URL", d.querySvc.GetQueryEndpoint(),
				)
				d.forceResetActiveJsonRpcUrl(true)
				return nil
			}

			var checkRetryIndexFailedBlock bool

			if upstreamRpcLatestBlock <= latestIndexedBlock {
				// no new block to index

				checkRetryIndexFailedBlock = true
			} else {
				checkRetryIndexFailedBlock = false

				nextBlockToIndexFrom := latestIndexedBlock + 1
				nextBlockToIndexTo := libutils.MinInt64(
					upstreamRpcLatestBlock,
					nextBlockToIndexFrom+constants.MaximumNumberOfBlocksToIndexPerBatch-1,
				)

				fatalErr, _ := d.fetchAndIndexingBlockRange(
					nextBlockToIndexFrom, nextBlockToIndexTo,
					bech32Cfg,
					pcitypes.IndexingModeNewBlocks,
				)
				if fatalErr != nil {
					logger.Error(
						"fatal error while fetching and indexing block range",
						"from", nextBlockToIndexFrom,
						"to", nextBlockToIndexTo,
						"chain-id", d.chainId,
						"error", fatalErr.Error(),
					)
					return fatalErr
				}

				if nextBlockToIndexTo < upstreamRpcLatestBlock {
					catchUp = true
					logger.Debug("catching up", "chain-id", d.chainId, "from", nextBlockToIndexTo+1, "to", upstreamRpcLatestBlock)
				} else {
					checkRetryIndexFailedBlock = true
				}
			}

			if checkRetryIndexFailedBlock && !d.indexingCfg.DisableRetryIndexFailedBlocks {
				height, err := db.GetOneFailedBlock(d.chainId)
				if err != nil {
					logger.Error(
						"failed to get one failed block for retry indexing",
						"chain-id", d.chainId,
						"error", err.Error(),
					)
					// no further action, just wait for next round
				} else if height > 0 {
					logger.Debug("retrying failed block", "chain-id", d.chainId, "height", height)

					time.Sleep(50 * time.Millisecond) // sleep for a while before retrying the failed block

					perBlockErr, _ := d.fetchAndIndexingBlockRange(
						height, height,
						bech32Cfg,
						pcitypes.IndexingModeRetryFailedBlocks,
					)
					if perBlockErr == nil {
						dbTx, err := db.BeginDatabaseTransaction(context.Background())
						if err == nil {
							err = dbTx.RemoveFailedBlockRecord(d.chainId, height)
							if err == nil {
								err = dbTx.CommitTransaction()
								if err != nil {
									logger.Error(
										"failed to commit transaction that remove the failed block",
										"error", err.Error(),
									)
									// it is not important to be failed
									_ = dbTx.RollbackTransaction()
								}
							} else {
								logger.Error(
									"failed to remove failed block record",
									"chain-id", d.chainId,
									"height", height,
									"error", err.Error(),
								)
								// it is not important to be failed
								_ = dbTx.RollbackTransaction()
							}
						} else {
							logger.Error("failed to begin transaction", "error", err.Error())
							// it is not important to be failed
						}
					} else {
						logger.Error(
							"fatal error while fetching and indexing the failed block",
							"height", height,
							"chain-id", d.chainId,
							"error", perBlockErr.Error(),
						)
						// it is not important to be failed
					}
				} else {
					logger.Debug("no candidate failed block to retry", "chain-id", d.chainId)
				}
			}

			return nil
		})
	}

	logger.Info("shutting down indexer", "name", d.chainName)
}

// fetchAndIndexingBlockRange will fetch the block range from RPC and index it.
func (d *defaultIndexer) fetchAndIndexingBlockRange(
	nextBlockToIndexFrom, nextBlockToIndexTo int64,
	bech32Cfg dbtypes.Bech32PrefixOfChainInfo,
	indexingMode pcitypes.IndexingMode,
) (
	fatalError pcitypes.FatalError, // is not per-block-level error since the failed-to-index block will be put into the `failed_block` table.
	isFetchRpcErr bool, // is true if the fatal error is due to failed to fetch from RPC
) {
	indexerCtx := types.UnwrapIndexerContext(d.ctx)
	db := indexerCtx.GetDatabase()
	logger := indexerCtx.GetLogger()

	beTransactionsInBlockRange, _, fetchErr := d.querySvc.BeTransactionsInBlockRange(nextBlockToIndexFrom, nextBlockToIndexTo)

	if fetchErr != nil && querytypes.IsErrBlackList(fetchErr) {
		// it's a malformed response, then it is a fatal error
		blackListErr := fetchErr

		d.forceResetActiveJsonRpcUrl(true)
		logger.Error(
			"malformed response",
			"chain-id", d.chainId,
			"endpoint", "be_getTransactionsInBlockRange",
			"error", blackListErr.Error(),
			"idx-mode", indexingMode.String(),
		)

		fatalError = blackListErr
		return
	}

	if fetchErr != nil {
		// failed to query, got no data, then it is a fatal error

		logger.Error(
			"failed to get transactions in block range, waiting for next round",
			"chain-id", d.chainId,
			"error", fetchErr.Error(),
			"idx-mode", indexingMode.String(),
		)

		fatalError = fetchErr
		isFetchRpcErr = true
		return
	}

	if len(beTransactionsInBlockRange.ErrorBlocks) > 0 {
		sqlErr := db.InsertOrUpdateFailedBlocks(d.chainId, beTransactionsInBlockRange.ErrorBlocks, fmt.Errorf("rpc marks error"))
		if sqlErr != nil {
			// insert into the table is mandatory, then it is a fatal error

			logger.Error(
				"failed to insert/update failed block",
				"chain-id", d.chainId,
				"error", sqlErr.Error(),
				"idx-mode", indexingMode.String(),
			)

			fatalError = sqlErr
			return
		}
	}

	if len(beTransactionsInBlockRange.MissingBlocks) > 0 {
		sqlErr := db.InsertOrUpdateFailedBlocks(d.chainId, beTransactionsInBlockRange.MissingBlocks, fmt.Errorf("rpc marks missing"))
		if sqlErr != nil {
			// insert into the table is mandatory, then it is a fatal error

			logger.Error(
				"failed to insert/update failed block",
				"chain-id", d.chainId,
				"error", sqlErr.Error(),
				"idx-mode", indexingMode.String(),
			)

			fatalError = sqlErr
			return
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
			panic(fmt.Sprintf("unexpected block height 0 when indexing %s", d.chainId))
		}

		if len(block.Transactions) < 1 {
			// skip empty block

			sqlErr := db.SetLatestIndexedBlock(d.chainId, blockHeight)
			if sqlErr != nil {
				// error when updating the table, look like there is a db connection issue, then it is a fatal error

				logger.Error(
					"failed to set latest indexed block",
					"chain-id", d.chainId,
					"height", blockHeight,
					"error", sqlErr.Error(),
					"txs", 0,
					"idx-mode", indexingMode.String(),
				)

				fatalError = sqlErr
				return
			}

			return
		}

		epochWeek := utils.GetEpochWeek(block.TimeEpochUTC)
		if !d.sharedCache.IsCreatedPartitionsForEpochWeek(epochWeek) {
			// prepare partitioned tables for this epoch week
			sqlErr := utils.ObserveLongOperation("create partitioned tables for epoch week", func() error {
				return db.PreparePartitionedTablesForEpoch(block.TimeEpochUTC)
			}, 15*time.Second, logger)
			if sqlErr != nil {
				// error when preparing the partitioned tables, then it is a fatal error

				logger.Error(
					"failed to create partitioned tables for epoch, retrying...",
					"epoch-week", epochWeek,
					"error", sqlErr.Error(),
				)
				time.Sleep(15 * time.Second)

				fatalError = errors.Wrap(
					sqlErr,
					fmt.Sprintf("failed to create partitioned tables for epoch week: %d", epochWeek),
				)
				return
			}

			logger.Info(
				"successfully prepared partitioned tables for epoch week",
				"epoch-week", epochWeek,
			)
			d.sharedCache.MarkCreatedPartitionsForEpochWeek(epochWeek)
		}

		dbTx, sqlErr := db.BeginDatabaseTransaction(context.Background())
		if sqlErr != nil {
			// error when begin a database transaction, then it is a fatal error

			logger.Error(
				"failed to begin transaction",
				"error", sqlErr.Error(),
				"idx-mode", indexingMode.String(),
			)

			fatalError = sqlErr
			return
		}

		perBlockErr := d.insertBlockInformation(blockHeight, block, bech32Cfg, dbTx)
		if perBlockErr != nil {
			logger.Error(
				"failed to insert block information",
				"chain-id", d.chainId,
				"height", blockHeight,
				"txs", len(block.Transactions),
				"error", perBlockErr.Error(),
				"idx-mode", indexingMode.String(),
			)
			// to be handled with rollback operation
		}

		if perBlockErr == nil && len(block.Transactions) > 0 {
			perBlockErr = dbTx.CleanupZeroRefCountRecentAccountTransaction()
			if perBlockErr != nil {
				logger.Error(
					"failed to cleanup zero ref count recent account transaction",
					"chain-id", d.chainId,
					"height", blockHeight,
					"error", perBlockErr.Error(),
					"idx-mode", indexingMode.String(),
				)
				// to be handled with rollback operation
			}
		}

		if perBlockErr == nil {
			perBlockErr = dbTx.SetLatestIndexedBlock(d.chainId, blockHeight)
			if perBlockErr != nil {
				logger.Error(
					"failed to set latest indexed block",
					"chain-id", d.chainId,
					"height", blockHeight,
					"error", perBlockErr.Error(),
					"idx-mode", indexingMode.String(),
				)
				// to be handled with rollback operation
			}
		}

		if perBlockErr == nil {
			perBlockErr = dbTx.RemoveFailedBlockRecord(d.chainId, blockHeight)
			if perBlockErr != nil {
				logger.Error(
					"failed to remove failed block record",
					"chain-id", d.chainId,
					"height", blockHeight,
					"error", perBlockErr.Error(),
					"idx-mode", indexingMode.String(),
				)
				// to be handled with rollback operation
			}
		}

		if perBlockErr != nil {
			logger.Error(
				"failed to insert block information, rollback",
				"chain-id", d.chainId,
				"height", blockHeight,
				"txs", len(block.Transactions),
				"error", perBlockErr.Error(),
				"idx-mode", indexingMode.String(),
			)
			_ = dbTx.RollbackTransaction()

			sqlErr := db.InsertOrUpdateFailedBlocks(d.chainId, []int64{blockHeight}, perBlockErr)
			if sqlErr != nil {
				// there is no longer something that can mark the block as failed, then it is a fatal error

				logger.Error(
					"failed to insert/update failed block after rollback",
					"chain-id", d.chainId,
					"height", blockHeight,
					"error", sqlErr.Error(),
					"idx-mode", indexingMode.String(),
				)

				fatalError = sqlErr
				return
			}
			continue
		}

		perBlockErr = dbTx.CommitTransaction()
		if perBlockErr != nil {
			logger.Error(
				"failed to commit block information",
				"chain-id", d.chainId,
				"height", blockHeight,
				"txs", len(block.Transactions),
				"error", perBlockErr.Error(),
				"idx-mode", indexingMode.String(),
			)

			sqlErr := db.InsertOrUpdateFailedBlocks(d.chainId, []int64{blockHeight}, perBlockErr)
			if sqlErr != nil {
				// there is no longer something that can mark the block as failed, then it is a fatal error

				logger.Error(
					"failed to insert/update failed block after failed to commit",
					"chain-id", d.chainId,
					"height", blockHeight,
					"error", sqlErr.Error(),
					"idx-mode", indexingMode.String(),
				)

				fatalError = sqlErr
				return
			}
			continue
		}

		logger.Debug(
			"indexed block successfully",
			"chain-id", d.chainId,
			"height", blockHeight,
			"txs", len(block.Transactions),
			"idx-mode", indexingMode.String(),
		)
	}

	return
}

func (d *defaultIndexer) insertBlockInformation(height int64, block querytypes.BlockInResponseBeTransactionsInBlockRange, bech32Cfg dbtypes.Bech32PrefixOfChainInfo, dbTx database.DbTransaction) error {
	var recordsTxs dbtypes.RecordsTransaction
	mapInvolvedAccounts := make(map[string]dbtypes.RecordAccount)
	var recentAccountTxs dbtypes.RecordsRecentAccountTransaction
	var refAccountToRecentTxs dbtypes.RecordsRefAccountToRecentTx

	for _, transaction := range block.Transactions {
		// build transaction record

		recordTx := dbtypes.NewRecordTransactionForInsert(
			d.chainId,
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
							d.chainId,
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
						d.chainId,
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
					d.chainId,
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
func (d *defaultIndexer) genericLoop(f func(querytypes.ResponseBeGetChainInfo) error) (err error) {
	indexerCtx := types.UnwrapIndexerContext(d.ctx)
	logger := indexerCtx.GetLogger()

	// check if active json rpc url is still valid, and use the most up-to-date, the fastest one
	_, beGetChainInfo := d.refreshActiveJsonRpcUrl()

	activeJsonRpcUrl, _ := d.getActiveJsonRpcUrlAndLastCheck()
	// if no active json rpc url at this point, skip indexing
	if len(activeJsonRpcUrl) == 0 {
		logger.Error("no active json-rpc url, skip this round", "chain-id", d.chainId)
		d.forceResetActiveJsonRpcUrl(true)
		time.Sleep(15 * time.Second)
		return fmt.Errorf("no active json-rpc url")
	}

	// use the active url
	d.querySvc.SetQueryEndpoint(activeJsonRpcUrl)

	if beGetChainInfo == nil {
		beGetChainInfo, _, err = d.querySvc.BeGetChainInfo()
		if err != nil {
			logger.Error("failed to get chain info, waiting for next round", "chain-id", d.chainId, "error", err.Error())
			return err
		}
	}

	// validate chain info
	// Even tho the validation was performed earlier, it's better to double-check and provide more context
	if beGetChainInfo.ChainId != d.chainId {
		logger.Error("chain-id mismatch", "expected", d.chainId, "got", beGetChainInfo.ChainId)
		d.forceResetActiveJsonRpcUrl(true)
		return fmt.Errorf("chain-id mismatch")
	}

	return f(*beGetChainInfo)
}

func (d *defaultIndexer) Reload(chainConfig types.ChainConfig) error {
	d.Lock()
	defer d.Unlock()

	if chainConfig.ChainId != d.chainId {
		return fmt.Errorf("mis-match chain-id, expected %s, got new %s", d.chainId, chainConfig.ChainId)
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

func (d *defaultIndexer) getBeRpcUrlsWithRLock() []string {
	d.RLock()
	defer d.RUnlock()

	return d.chainConfig.BeJsonRpcUrls[:]
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
