'use client';

import Box from '@mui/material/Box';
import Header from './_Header';
import Sider from './_Sider';
import React, { useEffect, useRef, useState } from 'react';
import { SIDER_WIDTH } from '@/consts/theme';
import { usePathname } from 'next/navigation';
import { useRollappStore } from '@/stores/rollappStore';
import { RollappActionTypes } from '@/consts/actionTypes';
import SearchModal from '../../search/SearchModal';

type LayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function Layout({ children }: LayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const isClosing = useRef(false);
  const pathname = usePathname();
  const [, dispatch] = useRollappStore(false);

  useEffect(() => {
    dispatch(RollappActionTypes.POPULATE_CHAIN_DATA_BY_PATHNAME, pathname);
  }, [pathname, dispatch]);

  const handleMenuToggle = () => {
    if (!isClosing.current) {
      setMenuOpen(!menuOpen);
    }
  };

  const handleMenuClose = () => {
    isClosing.current = true;
    setMenuOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    isClosing.current = false;
  };

  return (
    <Box display="flex">
      <Header
        handleMenuToggle={handleMenuToggle}
        openSearch={() => setSearchOpen(true)}
      />
      <Sider
        width={SIDER_WIDTH}
        menuOpen={menuOpen}
        handleMenuClose={handleMenuClose}
        handleDrawerTransitionEnd={handleDrawerTransitionEnd}
      />
      <SearchModal
        open={isSearchOpen}
        handleClose={() => setSearchOpen(false)}
      />
      {children}
    </Box>
  );
}
