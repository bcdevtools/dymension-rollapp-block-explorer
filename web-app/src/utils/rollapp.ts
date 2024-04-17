import { chain_info } from '@prisma/client';

export type RollappInfo = {
  path: string;
} & chain_info;

export function normalizeRollappsInfo(chainInfos: chain_info[]): RollappInfo[] {
  return chainInfos.map(chainInfo => ({
    ...chainInfo,
    path: `/${chainInfo.name
      .toLowerCase()
      .replace(/[^a-z0-9-\s]/g, '')
      .trim()
      .replace(/\s/g, '-')}`,
  }));
}

export function getRollappInfoByPath(
  chainInfos: chain_info[],
  path: string
): RollappInfo | undefined {
  return normalizeRollappsInfo(chainInfos).find(
    rollappInfo => rollappInfo.path === path
  );
}
