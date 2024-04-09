import { getRollappInfoByPath } from '@/utils/rollapp';
import { getChainInfos } from './db/chainInfo';

export async function getRollAppInfoByRollappPath(rollappPath: string) {
  const chainInfos = await getChainInfos();
  return getRollappInfoByPath(chainInfos, `/${rollappPath}`);
}
