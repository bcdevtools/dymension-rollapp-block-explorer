import { ChainInfo } from '@/services/db/chainInfo';

export type RollappInfo = {
  path: string;
} & ChainInfo;

export interface RollappInfoMap {
  [chainId: string]: RollappInfo;
}

export function getRollappPathByName(name: string) {
  return `/${name
    .toLowerCase()
    .replace(/[^a-z0-9-\s]/g, '')
    .trim()
    .replace(/\s/g, '-')}`;
}

export function normalizeRollappsInfo(chainInfos: ChainInfo[]): RollappInfo[] {
  return chainInfos
    .map(chainInfo => ({
      ...chainInfo,
      path: getRollappPathByName(chainInfo.name),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getRollappInfoByPath(chainInfos: ChainInfo[], path: string): RollappInfo | undefined {
  return normalizeRollappsInfo(chainInfos).find(rollappInfo => rollappInfo.path === path);
}

export function rollappInfosToObject(rollappInfos: RollappInfo[]) {
  return rollappInfos.reduce<RollappInfoMap>(
    (finalObj, rollappInfo) => ({
      ...finalObj,
      [rollappInfo.chain_id]: rollappInfo,
    }),
    {},
  );
}

export function getFavoriteRollapps(): Record<string, boolean> {
  const favoriteRollapps = localStorage.getItem('favoriteRollapps');
  return favoriteRollapps ? JSON.parse(favoriteRollapps) : {};
}

export function setFavoriteRollapp(chainId: string, isFavorite: boolean) {
  const favoriteRollapps = getFavoriteRollapps();
  favoriteRollapps[chainId] = isFavorite;
  localStorage.setItem('favoriteRollapps', JSON.stringify(favoriteRollapps));
}
