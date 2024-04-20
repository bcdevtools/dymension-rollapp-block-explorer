import { getChainIdAndTxHashByHash } from '@/actions/transaction';
import { ChainType } from '@/consts/setting';
import {
  RollappAddress,
  isCosmosAddress,
  isEvmAddress,
  isTxHash,
} from '@/utils/address';
import { RollappInfoMap, rollappInfosToObject } from '@/utils/rollapp';
import { RollappInfo } from '@/utils/rollapp';
import { getAddress } from '@ethersproject/address';
import { JsonObject } from '@prisma/client/runtime/library';

type TxSearchResult = {
  txHash: string;
  rollappInfo: RollappInfo;
};

type AccountSearchResult = {
  account: string;
  rollappInfos: RollappInfo[];
};

export type SearchResult = Partial<{
  rollapps: RollappInfo[];
  blocks: RollappInfo[];
  txs: TxSearchResult[];
  accounts: AccountSearchResult;
}>;

function getBlockSearchResult(searchText: string, rollappInfos: RollappInfo[]) {
  return /^\d+$/.test(searchText)
    ? rollappInfos.filter(i => i.latest_indexed_block >= +searchText)
    : null;
}

function getRollappSearchResult(
  searchText: string,
  rollappInfos: RollappInfo[]
) {
  searchText = searchText.toLowerCase();
  const result = rollappInfos.filter(
    i =>
      i.name.toLowerCase().includes(searchText) ||
      i.chain_id.toLowerCase().includes(searchText)
  );
  return result.length ? result : null;
}

function getAccountSearchResult(
  searchText: string,
  rollappInfos: RollappInfo[]
): AccountSearchResult | null {
  if (isEvmAddress(searchText)) {
    return {
      account: getAddress(searchText),
      rollappInfos: rollappInfos.filter(i => i.chain_type === ChainType.EVM),
    };
  } else if (isCosmosAddress(searchText)) {
    const rollappAddress = RollappAddress.fromBech32(searchText);
    return rollappAddress
      ? {
          account: searchText.toLowerCase(),
          rollappInfos: rollappInfos.filter(
            i =>
              ((i.bech32! as JsonObject).addr as string) ===
              rollappAddress.prefix
          ),
        }
      : null;
  } else return null;
}

async function getTransactionSearchResult(
  searchText: string,
  rollappInfoMap: RollappInfoMap
): Promise<TxSearchResult[] | null> {
  if (!isTxHash(searchText)) return null;
  const txs = await getChainIdAndTxHashByHash(searchText);
  return txs.length
    ? txs.map(i => ({
        txHash: i.hash,
        rollappInfo: rollappInfoMap[i.chain_id],
      }))
    : null;
}

export async function handleGlobalSearch(
  searchText: string,
  rollappInfos: RollappInfo[],
  selectedRollappInfo?: RollappInfo | null
): Promise<SearchResult> {
  rollappInfos = rollappInfos.sort((a, b) => {
    if (a.chain_id === selectedRollappInfo?.chain_id) return -1;
    else if (b.chain_id === selectedRollappInfo?.chain_id) return 1;
    return a.name.localeCompare(b.name);
  });

  const result: SearchResult = {};

  const rollappInfoMap = rollappInfosToObject(rollappInfos);

  searchText = searchText.trim();

  if (searchText) {
    const [
      searchByBlockResult,
      searchByTxResult,
      searchByAccountResult,
      searchByRollappResult,
    ] = await Promise.all([
      getBlockSearchResult(searchText, rollappInfos),
      getTransactionSearchResult(searchText, rollappInfoMap),
      getAccountSearchResult(searchText, rollappInfos),
      getRollappSearchResult(searchText, rollappInfos),
    ]);

    if (searchByBlockResult) {
      result.blocks = searchByBlockResult;
    }
    if (searchByTxResult) {
      result.txs = searchByTxResult;
    }
    if (searchByAccountResult) {
      result.accounts = searchByAccountResult;
    }
    if (searchByRollappResult) {
      result.rollapps = searchByRollappResult;
    }
  } else {
    result.rollapps = rollappInfos;
  }
  return result;
}
