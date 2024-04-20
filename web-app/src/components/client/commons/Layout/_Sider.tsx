'use client';

import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Summarize from '@mui/icons-material/Summarize';
import Widgets from '@mui/icons-material/Widgets';
import Receipt from '@mui/icons-material/Receipt';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Path } from '@/consts/path';
import { useRollappStore } from '@/stores/rollappStore';
import { getNewPathByRollapp, isNotFoundPath } from '@/utils/common';
import RollappSelect from '../RollappSelect';

type SiderProps = Readonly<{
  menuOpen: boolean;
  width: number;
  handleMenuClose: () => void;
  handleDrawerTransitionEnd: () => void;
}>;

const MENU_ITEMS = [
  { name: 'Overview', path: Path.OVERVIEW, icon: <Summarize /> },
  { name: 'Blocks', path: Path.BLOCKS, icon: <Widgets /> },
  { name: 'Transactions', path: Path.TRANSACTIONS, icon: <Receipt /> },
];

export default React.memo(function Sider({
  width,
  menuOpen,
  handleMenuClose,
  handleDrawerTransitionEnd,
}: SiderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [{ selectedRollappInfo }] = useRollappStore(true);

  const handleMenuItemClick = (path: string) => {
    router.push(getNewPathByRollapp(pathname, path));
    handleMenuClose();
  };

  const isSelecting = (path: string) => {
    const splittedPath = pathname.split('/');
    return (
      (path === '/' && splittedPath.length === 2) ||
      `/${splittedPath[2]}` === path
    );
  };

  const drawer = (
    <>
      <Toolbar sx={{ display: { xs: 'none', md: 'flex' } }} />
      <List>
        <ListItem>
          <RollappSelect
            fullWidth
            size="small"
            value={selectedRollappInfo!.path}
            onValueChange={e => {
              router.push(
                isNotFoundPath(pathname)
                  ? e.target.value
                  : pathname.replace(/^\/[^\/]*/, e.target.value!)
              );
            }}
          />
        </ListItem>
        {MENU_ITEMS.map((menuItem, index) => (
          <ListItem key={index} disablePadding>
            <ListItemButton
              onClick={() => handleMenuItemClick(menuItem.path)}
              selected={isSelecting(menuItem.path)}>
              <ListItemIcon>{menuItem.icon}</ListItemIcon>
              <ListItemText primary={menuItem.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </>
  );

  const container =
    typeof window !== 'undefined' ? () => window.document.body : undefined;

  return (
    <Box component="nav" sx={{ width: { md: width }, flexShrink: { md: 0 } }}>
      {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
      <Drawer
        container={container}
        variant="temporary"
        open={menuOpen}
        onTransitionEnd={handleDrawerTransitionEnd}
        onClose={handleMenuClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width },
        }}>
        {drawer}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width },
        }}
        open>
        {drawer}
      </Drawer>
    </Box>
  );
});
