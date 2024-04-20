'use server';

import { getChainIdAndTxHashByTxHashes } from '@/services/db/transactions';
import { isTxHash } from '@/utils/address';

export async function getChainIdAndTxHashByHash(txHash: string) {
  txHash = txHash.trim();
  if (!txHash || !isTxHash(txHash)) throw new Error('Invalid TxHash');

  const txhashesToCheck = txHash.startsWith('0x')
    ? [txHash.toLowerCase(), txHash.substring(2).toUpperCase()]
    : [`0x${txHash.toLowerCase()}`, txHash.toUpperCase()];

  const txs = await getChainIdAndTxHashByTxHashes(txhashesToCheck);

  return txs;
}
