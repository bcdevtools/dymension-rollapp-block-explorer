import { RollappActionTypes } from '@/consts/actionTypes';
import { Store, useStore } from '@/hooks/useStore';
import { getRollappStateByPathname } from '@/utils/store';

export type RollappState = {
  chainId: string | null;
  chainPath: string;
};

export const defaultRollappState: RollappState = {
  chainId: null,
  chainPath: '/',
};

const actions = {
  [RollappActionTypes.POPULATE_CHAIN_DATA_BY_PATHNAME]: (
    state: RollappState,
    pathname: string
  ) => {
    return getRollappStateByPathname(pathname);
  },
};

let rollappStore: Store<RollappState, typeof actions>;

export function initRollappStore(
  initialState: RollappState = defaultRollappState
) {
  rollappStore = new Store(initialState, actions);
}

export function useRollappStore(shouldListen?: boolean) {
  return useStore(rollappStore, shouldListen);
}
