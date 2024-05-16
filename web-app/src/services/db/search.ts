import { searchByTxHash } from '@/actions/transaction';
import {
  RollappAddress,
  isCosmosAddress,
  isEvmAddress,
  isTxHash,
} from '@/utils/address';
import {
  getChainInfoByPrefix,
  getEvmChainInfo,
  searchChainInfoByMultipleFields,
} from './chainInfo';

export const handleGlobalSearchOnServer = async function (value: string) {
  if (isTxHash(value)) {
    const txs = await searchByTxHash(value);
    return txs.length ? { txs } : {};
  } else if (isEvmAddress(value)) {
    const evmRollapps = await getEvmChainInfo();
    return evmRollapps.length ? { addess: evmRollapps } : {};
  } else if (isCosmosAddress(value)) {
    const rollappAddress = RollappAddress.fromBech32(value);
    const result = await getChainInfoByPrefix(rollappAddress.prefix);
    return result.length ? { addess: result } : {};
  } else {
    const result = await searchChainInfoByMultipleFields(value);
    return result.length
      ? {
          chainNameOrChainIdOrBlock: result.map(i => ({
            chain_id: i.chain_id,
            name: i.name,
            height: i.latest_indexed_block,
          })),
        }
      : {};
  }
};
