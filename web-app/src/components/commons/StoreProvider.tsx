'use client';
import { initRollappStore } from '@/stores/rollappStore';
import { getRollappStateByPathname } from '@/utils/store';
import { usePathname } from 'next/navigation';
import { useRef } from 'react';

export function StoreProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const hasInitStore = useRef(false);
  const pathname = usePathname();
  if (!hasInitStore.current) {
    initRollappStore(getRollappStateByPathname(pathname));
    hasInitStore.current = true;
  }
  return children;
}
