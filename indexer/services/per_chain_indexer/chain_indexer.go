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
	"strconv"
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

	for !d.isShuttingDownWithRLock() {
		time.Sleep(d.indexingCfg.IndexBlockInterval)

		_ = d.genericLoop(func(beGetChainInfo *querytypes.ResponseBeGetChainInfo) error {
			// perform indexing
			latestIndexedBlock, err := db.GetLatestIndexedBlock(d.chainConfig.ChainId)
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

			for heightStr, block := range beTransactionsInBlockRange.Blocks {
				if len(block.Transactions) < 1 {
					// skip empty block
					continue
				}

				blockHeight, err := strconv.ParseInt(heightStr, 10, 64)
				if err != nil {
					panic(err)
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

					logger.Info("successfully prepared partitioned tables for epoch week", "chain-id", d.chainConfig.ChainId, "epoch-week", epochWeek)
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

				if err == nil {
					err = db.SetLatestIndexedBlock(d.chainConfig.ChainId, blockHeight)
				}

				if err == nil {
					err = dbTx.RemoveFailedBlockRecord(d.chainConfig.ChainId, blockHeight)
				}

				if err != nil {
					_ = dbTx.RollbackTransaction()
					_ = db.InsertOrUpdateFailedBlock(d.chainConfig.ChainId, blockHeight, err)
					continue
				}

				err = dbTx.CommitTransaction()
				if err != nil {
					logger.Error("failed to commit transaction", "error", err.Error())
					_ = db.InsertOrUpdateFailedBlock(d.chainConfig.ChainId, blockHeight, err)
					continue
				}

				logger.Debug("indexed block successfully", "chain-id", d.chainConfig.ChainId, "height", blockHeight)
			}

			return nil
		})
	}

	logger.Info("shutting down indexer", "name", d.chainName)
}

func (d *defaultIndexer) insertBlockInformation(height int64, block querytypes.BlockInResponseBeTransactionsInBlockRange, bech32Cfg dbtypes.Bech32PrefixOfChainInfo, dbTx database.DbTransaction) error {
	var recordsTxs dbtypes.RecordsTransaction
	mapInvolvedAccounts := make(map[string]dbtypes.RecordAccount)

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

		// build involved accounts record

		if len(transaction.Involvers) > 0 {
			for _, involvers := range transaction.Involvers {
				for _, involver := range involvers {
					var bech32Address string
					var err error

					normalizedAddress := utils.NormalizeAddress(involver)
					if utils.IsEvmAddress(normalizedAddress) {
						evmAddr := common.HexToAddress(normalizedAddress)
						bech32Address, err = sdk.Bech32ifyAddressBytes(bech32Cfg.Bech32PrefixAccAddr, evmAddr.Bytes())
						if err != nil {
							return errors.Wrapf(err, "failed to bech32ify address %s", normalizedAddress)
						}
						bech32Address = utils.NormalizeAddress(bech32Address)
					} else if _, possibleBech32Addr := utils.UnsafeExtractBech32Hrp(normalizedAddress); possibleBech32Addr {
						// ok
						bech32Address = normalizedAddress
					} else {
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
				}
			}
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
