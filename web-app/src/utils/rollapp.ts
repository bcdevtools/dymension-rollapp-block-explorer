import { ChainInfo } from '@/services/db/chainInfo';

export type RollappInfo = {
  path: string;
} & ChainInfo;

export interface RollappInfoMap {
  [chainId: string]: RollappInfo;
}

export function normalizeRollappsInfo(chainInfos: ChainInfo[]): RollappInfo[] {
  return chainInfos
    .map(chainInfo => ({
      ...chainInfo,
      path: `/${chainInfo.name
        .toLowerCase()
        .replace(/[^a-z0-9-\s]/g, '')
        .trim()
        .replace(/\s/g, '-')}`,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getRollappInfoByPath(
  chainInfos: ChainInfo[],
  path: string
): RollappInfo | undefined {
  return normalizeRollappsInfo(chainInfos).find(
    rollappInfo => rollappInfo.path === path
  );
}

export function rollappInfosToObject(rollappInfos: RollappInfo[]) {
  return rollappInfos.reduce<RollappInfoMap>(
    (finalObj, rollappInfo) => ({
      ...finalObj,
      [rollappInfo.chain_id]: rollappInfo,
    }),
    {}
  );
}
