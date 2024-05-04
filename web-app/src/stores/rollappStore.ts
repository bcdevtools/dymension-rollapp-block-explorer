import { RollappActionTypes } from '@/consts/actionTypes';
import { DenomsMetadata } from '@/consts/rpcResTypes';
import { Store, useStore } from '@/hooks/useStore';
import { RpcService } from '@/services/rpc.service';
import { RollappInfo } from '@/utils/rollapp';
import {
  getRpcServiceFromSelectedRollappInfo,
  getSelectedRollappInfoByPathname,
} from '@/utils/store';

export type RollappState = {
  rollappInfos: RollappInfo[];
  selectedRollappInfo: RollappInfo | null;
  rpcService: RpcService | null;
  denomsMetadata: DenomsMetadata | null;
};

export const defaultRollappState: RollappState = {
  selectedRollappInfo: null,
  rollappInfos: [],
  rpcService: null,
  denomsMetadata: null,
};

const actions = {
  [RollappActionTypes.POPULATE_CHAIN_DATA_BY_PATHNAME]: (
    currentState: RollappState,
    rollappPath: string
  ) => {
    if (rollappPath === currentState.selectedRollappInfo?.path) return {};
    const selectedRollappInfo = getSelectedRollappInfoByPathname(
      currentState.rollappInfos,
      rollappPath
    );
    const rpcService =
      getRpcServiceFromSelectedRollappInfo(selectedRollappInfo);

    return { selectedRollappInfo, rpcService, denomsMetadata: null };
  },
  [RollappActionTypes.UPDATE_DENOMS_METADATA]: (
    currentState: RollappState,
    denomsMetadata: DenomsMetadata
  ) => {
    return { denomsMetadata };
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
