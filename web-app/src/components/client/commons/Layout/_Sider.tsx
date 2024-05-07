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
import FactCheckIcon from '@mui/icons-material/FactCheck';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Path } from '@/consts/path';
import { useRollappStore } from '@/stores/rollappStore';
import { getNewPathByRollapp, isNotFoundPath } from '@/utils/common';
import RollappSelect from '../RollappSelect';
import Typography from '@mui/material/Typography';
import Link from 'next/link';

type SiderProps = Readonly<{
  menuOpen: boolean;
  width: number;
  handleMenuClose: () => void;
  handleDrawerTransitionEnd: () => void;
}>;

const MENU_ITEMS = [
  {
    name: 'Overview',
    path: Path.OVERVIEW,
    Icon: Summarize,
  },
  {
    name: 'Blocks',
    path: Path.BLOCKS,
    selectedPath: [Path.BLOCK],
    Icon: Widgets,
  },
  {
    name: 'Transactions',
    path: Path.TRANSACTIONS,
    selectedPath: [Path.TRANSACTION],
    Icon: Receipt,
  },
  {
    name: 'Governors',
    path: Path.VALIDATORS,
    Icon: FactCheckIcon,
  },
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

  const checkSelected = (path: string, selectedPaths: string[] = []) => {
    const splittedPath = pathname.split('/');
    if (path === '/' && splittedPath.length === 2) return true;
    const pathToCheck = `/${splittedPath[2]}`;
    return pathToCheck === path || selectedPaths.includes(pathToCheck);
  };

  const drawer = (
    <>
      <Toolbar sx={{ display: { xs: 'none', md: 'flex' } }} />
      <List>
        <ListItem sx={{ pb: 2 }}>
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
        {MENU_ITEMS.map((menuItem, index) => {
          const isSelected = checkSelected(
            menuItem.path,
            menuItem.selectedPath
          );
          const { Icon } = menuItem;
          return (
            <ListItem key={index} disablePadding>
              <ListItemButton
                href={getNewPathByRollapp(pathname, menuItem.path)}
                component={Link}
                onClick={() => handleMenuClose()}
                selected={isSelected}>
                <ListItemIcon>
                  <Icon color={isSelected ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    isSelected ? (
                      <Typography>
                        <strong>{menuItem.name}</strong>
                      </Typography>
                    ) : (
                      <Typography color="text.secondary">
                        {menuItem.name}
                      </Typography>
                    )
                  }
                />
              </ListItemButton>
            </ListItem>
          );
        })}
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
