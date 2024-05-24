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
import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Path } from '@/consts/path';
import { useRollappStore } from '@/stores/rollappStore';
import { getNewPathByRollapp, isNotFoundPath } from '@/utils/common';
import RollappSelect from '../RollappSelect';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import FeedIcon from '@mui/icons-material/Feed';
import Divider from '@mui/material/Divider';
import LayoutContext from '@/contexts/LayoutContext';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Collapse from '@mui/material/Collapse';
import AssuredWorkloadIcon from '@mui/icons-material/AssuredWorkload';
import TuneIcon from '@mui/icons-material/Tune';
import { MODULES } from '@/consts/params';

type SiderProps = Readonly<{
  menuOpen: boolean;
  width: number;
  handleDrawerTransitionEnd: () => void;
}>;

const MenuItem = React.memo(function _MenuItem({
  path,
  selectedPath = [],
  name,
  Icon,
  isNested = false,
}: Readonly<{
  path: string;
  selectedPath?: string[];
  name: string;
  Icon: React.ElementType;
  isNested?: boolean;
}>) {
  const pathname = usePathname();
  const checkSelected = (path: string, selectedPaths: string[] = []) => {
    const splittedPath = pathname.split('/');
    if (path === '/' && splittedPath.length === 2) return true;
    const pathToCheck = `/${splittedPath[2]}`;
    return pathToCheck === path || selectedPaths.includes(pathToCheck);
  };

  const isSelected = checkSelected(path, selectedPath);

  return (
    <LayoutContext.Consumer>
      {({ handleMenuClose }) => (
        <ListItem disablePadding>
          <ListItemButton
            href={getNewPathByRollapp(pathname, path)}
            component={Link}
            onClick={() => handleMenuClose()}
            selected={isSelected}
            sx={isNested ? { pl: 4 } : {}}>
            <ListItemIcon>
              <Icon color={isSelected ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText
              primary={
                isSelected ? (
                  <Typography>
                    <strong>{name}</strong>
                  </Typography>
                ) : (
                  <Typography color="text.secondary">{name}</Typography>
                )
              }
            />
          </ListItemButton>
        </ListItem>
      )}
    </LayoutContext.Consumer>
  );
});

export default React.memo(function Sider({ width, menuOpen, handleDrawerTransitionEnd }: SiderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [{ selectedRollappInfo }] = useRollappStore(true);
  const [governanceOpen, setGovernanceOpen] = useState(true);

  const drawer = (
    <>
      <Toolbar sx={{ display: { xs: 'none', md: 'flex' } }} />
      <List>
        <ListItem sx={{ pb: 2 }}>
          <RollappSelect
            fullWidth
            size="small"
            value={selectedRollappInfo?.path || ''}
            onValueChange={e => {
              router.push(isNotFoundPath(pathname) ? e.target.value : pathname.replace(/^\/[^\/]*/, e.target.value!));
            }}
          />
        </ListItem>
        <MenuItem name="Overview" path={Path.OVERVIEW} Icon={Summarize} />
        <MenuItem name="Blocks" path={Path.BLOCKS} Icon={Widgets} selectedPath={[Path.BLOCK]} />
        <MenuItem name="Transactions" path={Path.TRANSACTIONS} Icon={Receipt} selectedPath={[Path.TRANSACTION]} />
        <Divider />

        <ListItemButton onClick={() => setGovernanceOpen(!governanceOpen)}>
          <ListItemIcon>
            <AssuredWorkloadIcon />
          </ListItemIcon>
          <ListItemText primary="Governance" />
          {governanceOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={governanceOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <MenuItem name="Governors" path={Path.VALIDATORS} Icon={FactCheckIcon} isNested />
            <MenuItem name="Proposals" path={Path.PROPOSALS} Icon={FeedIcon} selectedPath={[Path.PROPOSAL]} isNested />
          </List>
        </Collapse>
        <Divider />
        <MenuItem name="Params" path={`${Path.PARAMS}/${MODULES[0]}`} selectedPath={[Path.PARAMS]} Icon={TuneIcon} />
      </List>
    </>
  );

  const container = typeof window !== 'undefined' ? () => window.document.body : undefined;

  return (
    <LayoutContext.Consumer>
      {({ handleMenuClose }) => (
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
      )}
    </LayoutContext.Consumer>
  );
});
