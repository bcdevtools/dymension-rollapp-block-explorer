import { RollappActionTypes } from '@/consts/actionTypes';
import { DenomsMetadata } from '@/consts/rpcResTypes';
import { Store, useStore } from '@/hooks/useStore';
import { RpcService } from '@/services/rpc.service';
import { RollappInfo, getFavoriteRollapps, setFavoriteRollapps } from '@/utils/rollapp';
import { getRpcServiceFromSelectedRollappInfo, getSelectedRollappInfoByPathname } from '@/utils/store';

export type RollappState = {
  rollappInfos: RollappInfo[];
  selectedRollappInfo: RollappInfo | null;
  rpcService: RpcService | null;
  denomsMetadata: DenomsMetadata;
  hasGottenDenomsMetadata: boolean;
};

export const defaultRollappState: RollappState = {
  selectedRollappInfo: null,
  rollappInfos: [],
  rpcService: null,
  denomsMetadata: {},
  hasGottenDenomsMetadata: false,
};

const actions = {
  [RollappActionTypes.POPULATE_CHAIN_DATA_BY_PATHNAME]: (currentState: RollappState, rollappPath: string) => {
    if (rollappPath === currentState.selectedRollappInfo?.path) return {};
    const selectedRollappInfo = getSelectedRollappInfoByPathname(currentState.rollappInfos, rollappPath);
    const rpcService = getRpcServiceFromSelectedRollappInfo(selectedRollappInfo);

    return {
      selectedRollappInfo,
      rpcService,
      denomsMetadata: {},
      hasGottenDenomsMetadata: false,
    };
  },
  [RollappActionTypes.UPDATE_DENOMS_METADATA]: (currentState: RollappState, denomsMetadata: DenomsMetadata) => {
    return { denomsMetadata, hasGottenDenomsMetadata: true };
  },
  [RollappActionTypes.RE_ORDER_ROLLAPPS]: (
    currentState: RollappState,
    newFavoriteInfo?: { chainId: string; isFavorite: boolean },
  ) => {
    const favoriteRollapps = getFavoriteRollapps();
    const getSortedRollappInfos = function () {
      return currentState.rollappInfos
        .map(rollappInfo => {
          rollappInfo.isFavorite = favoriteRollapps[rollappInfo.chain_id] || false;
          return rollappInfo;
        })
        .sort((a, b) => {
          if (a.isFavorite && !b.isFavorite) return -1;
          if (b.isFavorite && !a.isFavorite) return 1;
          return a.name.localeCompare(b.name);
        });
    };
    if (!newFavoriteInfo) return { rollappInfos: getSortedRollappInfos() };

    favoriteRollapps[newFavoriteInfo.chainId] = newFavoriteInfo.isFavorite;
    setFavoriteRollapps(favoriteRollapps);

    const newState: Partial<RollappState> = { rollappInfos: getSortedRollappInfos() };

    if (currentState.selectedRollappInfo?.chain_id === newFavoriteInfo.chainId) {
      newState.selectedRollappInfo = newState.rollappInfos!.find(i => i.chain_id === newFavoriteInfo.chainId) || null;
    }

    return newState;
  },
};

let rollappStore: Store<RollappState, typeof actions>;

export function initRollappStore(initialState: Partial<RollappState> = {}) {
  const state: RollappState = { ...defaultRollappState, ...initialState };
  rollappStore = new Store(state, actions);
}

export function useRollappStore(shouldListen?: boolean) {
  return useStore(rollappStore, shouldListen);
}
