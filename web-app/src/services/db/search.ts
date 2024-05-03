import { searchByTxHash } from '@/actions/transaction';
import {
  RollappAddress,
  isCosmosAddress,
  isEvmAddress,
  isTxHash,
} from '@/utils/address';
import prisma from '@/utils/prisma';
import {
  getChainInfoByPrefix,
  getEvmChainInfo,
  searchChainInfoByMultipleFields,
} from './chainInfo';

export function searchBlock(value: string) {
  if (!/^\d+$/.test(value)) return [];
  return prisma.chain_info.findMany({});
}

export const handleGlobalSearchOnServer = async function (value: string) {
  if (isTxHash(value)) {
    const txs = await searchByTxHash(value);
    return { txs };
  } else if (isEvmAddress(value)) {
    const evmRollapps = await getEvmChainInfo();
    return { addess: evmRollapps };
  } else if (isCosmosAddress(value)) {
    const rollappAddress = RollappAddress.fromBech32(value);
    const result = await getChainInfoByPrefix(rollappAddress.prefix);
    return { addess: result };
  } else {
    const result = await searchChainInfoByMultipleFields(value);
    return {
      chainNameOrChainIdOrBlock: result.map(i => ({
        chain_id: i.chain_id,
        name: i.name,
        height: i.latest_indexed_block,
      })),
    };
  }
};
