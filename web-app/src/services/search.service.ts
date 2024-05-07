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
  txHash: string; //Tx Hash can be displayed different on different rollapp
  rollappInfo: RollappInfo;
};

type AccountSearchResult = {
  account: string;
  rollappInfos: RollappInfo[];
};

type BlockSearchResult = {
  block: number;
  rollappInfos: RollappInfo[];
};

export type SearchResult = Partial<{
  rollapps: RollappInfo[];
  blocks: BlockSearchResult;
  txs: TxSearchResult[];
  accounts: AccountSearchResult;
}>;

function getBlockSearchResult(
  searchText: string,
  allRollappInfos: RollappInfo[]
): BlockSearchResult | null {
  if (!/^\d+$/.test(searchText)) return null;
  const rollappInfos = allRollappInfos.filter(
    i => i.latest_indexed_block >= +searchText
  );
  return rollappInfos.length
    ? {
        block: +searchText,
        rollappInfos,
      }
    : null;
}

function getRollappSearchResult(
  searchText: string,
  allRollappInfos: RollappInfo[]
) {
  searchText = searchText.toLowerCase();
  const result = allRollappInfos.filter(
    i =>
      i.name.toLowerCase().includes(searchText) ||
      i.chain_id.toLowerCase().includes(searchText)
  );
  return result.length ? result : null;
}

function getAccountSearchResult(
  searchText: string,
  allRollappInfos: RollappInfo[]
): AccountSearchResult | null {
  if (isEvmAddress(searchText)) {
    return {
      account: getAddress(searchText),
      rollappInfos: allRollappInfos.filter(i => i.chain_type === ChainType.EVM),
    };
  } else if (isCosmosAddress(searchText)) {
    const rollappAddress = RollappAddress.fromBech32(searchText);
    return rollappAddress
      ? {
          account: searchText.toLowerCase(),
          rollappInfos: allRollappInfos.filter(i => {
            const bech32 = i.bech32 as JsonObject;
            return (
              (bech32.addr as string) === rollappAddress.prefix ||
              (bech32.val as string) === rollappAddress.prefix
            );
          }),
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
  allRollappInfos: RollappInfo[],
  selectedRollappInfo?: RollappInfo | null
): Promise<SearchResult> {
  allRollappInfos = [...allRollappInfos].sort((a, b) => {
    if (a.chain_id === selectedRollappInfo?.chain_id) return -1;
    else if (b.chain_id === selectedRollappInfo?.chain_id) return 1;
    return a.name.localeCompare(b.name);
  });

  const result: SearchResult = {};

  const rollappInfoMap = rollappInfosToObject(allRollappInfos);

  searchText = searchText.trim();

  if (searchText) {
    const [
      searchByBlockResult,
      searchByTxResult,
      searchByAccountResult,
      searchByRollappResult,
    ] = await Promise.all([
      getBlockSearchResult(searchText, allRollappInfos),
      getTransactionSearchResult(searchText, rollappInfoMap),
      getAccountSearchResult(searchText, allRollappInfos),
      getRollappSearchResult(searchText, allRollappInfos),
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
    result.rollapps = allRollappInfos;
  }
  return result;
}
