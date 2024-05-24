'use server';

import { getChainIdAndTxHashByTxHashes, getTxHashAndChainInfoByTxHashes } from '@/services/db/transactions';
import { getTxHashesQueryValue } from '@/utils/transaction';

export async function getChainIdAndTxHashByHash(txHash: string) {
  const txhashesToCheck = getTxHashesQueryValue(txHash);

  const txs = await getChainIdAndTxHashByTxHashes(txhashesToCheck);

  return txs;
}

export async function searchByTxHash(txHash: string) {
  const txhashesToCheck = getTxHashesQueryValue(txHash);

  const txs = await getTxHashAndChainInfoByTxHashes(txhashesToCheck);

  return txs;
}
