import { RollappActionTypes } from '@/consts/actionTypes';
import { Store, useStore } from '@/hooks/useStore';
import { RollappInfo } from '@/utils/rollappInfo';
import { getSelectedRollappInfoByPathname } from '@/utils/store';

export type RollappState = {
  rollappInfos: RollappInfo[];
  selectedRollappInfo: RollappInfo | null;
};

export const defaultRollappState: RollappState = {
  selectedRollappInfo: null,
  rollappInfos: [],
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
    return { selectedRollappInfo };
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
