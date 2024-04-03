import { RollappState, defaultRollappState } from '@/stores/rollappStore';
import { getChainDataFromPathname } from './common';

export function getRollappStateByPathname(pathname: string): RollappState {
  const chainData = getChainDataFromPathname(pathname);
  return chainData
    ? { chainId: chainData.chainId, chainPath: chainData.path }
    : defaultRollappState;
}
