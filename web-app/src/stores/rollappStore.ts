import { RollappActionTypes } from '@/consts/actionTypes';
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
};

export const defaultRollappState: RollappState = {
  selectedRollappInfo: null,
  rollappInfos: [],
  rpcService: null,
};

const actions = {
  [RollappActionTypes.POPULATE_CHAIN_DATA_BY_PATHNAME]: (
    currentState: RollappState,
    pathname: string
  ) => {
    const selectedRollappInfo = getSelectedRollappInfoByPathname(
      currentState.rollappInfos,
      pathname
    );
    const rpcService =
      getRpcServiceFromSelectedRollappInfo(selectedRollappInfo);

    return { selectedRollappInfo, rpcService };
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
