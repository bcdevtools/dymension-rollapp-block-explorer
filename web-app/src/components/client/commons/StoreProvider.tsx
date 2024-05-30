'use client';
import { RollappActionTypes } from '@/consts/actionTypes';
import { initRollappStore, useRollappStore } from '@/stores/rollappStore';
import { RollappInfo } from '@/utils/rollapp';
import { getInitialRollappState } from '@/utils/store';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

type StoreProviderProps = Readonly<{
  children: React.ReactNode;
  initialState: {
    rollappInfos: RollappInfo[];
  };
}>;

export function StoreProvider({ children, initialState }: StoreProviderProps) {
  const hasInitStore = useRef(false);
  const pathname = usePathname();
  if (!hasInitStore.current) {
    initRollappStore(getInitialRollappState(initialState.rollappInfos, pathname));
    hasInitStore.current = true;
  }
  const [, dispatch] = useRollappStore(false);
  useEffect(() => void dispatch(RollappActionTypes.RE_ORDER_ROLLAPPS), [dispatch]);
  return children;
}
