'use client';
import { initRollappStore } from '@/stores/rollappStore';
import { RollappInfo } from '@/utils/rollappInfo';
import { getInitialRollappState } from '@/utils/store';
import { usePathname } from 'next/navigation';
import { useRef } from 'react';

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
    initRollappStore(
      getInitialRollappState(initialState.rollappInfos, pathname)
    );
  }
  return children;
}
