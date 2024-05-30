import { ChainInfo } from '@/services/db/chainInfo';

export type RollappInfo = {
  path: string;
  isFavorite: boolean;
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
  return chainInfos.map(chainInfo => ({
    ...chainInfo,
    path: getRollappPathByName(chainInfo.name),
    isFavorite: false,
  }));
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

type FavoriteRollapps = Record<string, boolean>;
const FAVORITE_ROLLAPPS_KEYS = 'favoriteRollapps';

export function getFavoriteRollapps(): FavoriteRollapps {
  const favoriteRollapps = localStorage.getItem(FAVORITE_ROLLAPPS_KEYS);
  return favoriteRollapps ? JSON.parse(favoriteRollapps) : {};
}

export function setFavoriteRollapps(favoriteRollapps: FavoriteRollapps) {
  localStorage.setItem(FAVORITE_ROLLAPPS_KEYS, JSON.stringify(favoriteRollapps));
}
