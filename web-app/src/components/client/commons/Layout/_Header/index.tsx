'use client';

import { styled, alpha } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import ThemeToggleButton from './_ThemeToggleButton';
import Logo from './_Logo';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import React, { FormEventHandler, useState } from 'react';
import { TOOLBAR_MOBILE_HEIGHT } from '@/consts/theme';
import { SEARCH_PLACEHOLDER } from '@/consts/setting';
import { usePathname, useRouter } from 'next/navigation';
import { useRollappStore } from '@/stores/rollappStore';
import { handleSearch } from '@/utils/common';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    zIndex: theme.zIndex.drawer + 1,
  },
}));

export const CustomToolbar = styled(Toolbar)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    minHeight: TOOLBAR_MOBILE_HEIGHT,
  },
}));

const StyledToolbar = styled(CustomToolbar)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(2),
  },
}));

const Search = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
  [theme.breakpoints.down('sm')]: {
    order: 1,
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    [theme.breakpoints.up('sm')]: {
      width: '32ch',
    },
    [theme.breakpoints.up('md')]: {
      '&:focus': {
        width: '53ch',
      },
    },
  },
}));

type HeaderProps = Readonly<{
  handleMenuToggle: () => void;
}>;

export default React.memo(function Header({ handleMenuToggle }: HeaderProps) {
  const [{ selectedRollappInfo }] = useRollappStore(true);
  const [searchValue, setSearchValue] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  const handleSubmit: FormEventHandler = e => {
    e.preventDefault();

    if (!searchValue) {
      return;
    }

    handleSearch(selectedRollappInfo!.path, searchValue, newPath => {
      if (pathname !== newPath) router.push(newPath);
      setSearchValue('');
    });
  };

  return (
    <StyledAppBar>
      <StyledToolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="open drawer"
          onClick={handleMenuToggle}
          sx={{ mr: 2, display: { md: 'none' } }}>
          <MenuIcon />
        </IconButton>
        <Logo />
        <Search component="form" onSubmit={handleSubmit}>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder={SEARCH_PLACEHOLDER}
            inputProps={{ 'aria-label': 'search' }}
            value={searchValue}
            onChange={e => void setSearchValue(e.target.value)}
          />
        </Search>
        <ThemeToggleButton />
      </StyledToolbar>
    </StyledAppBar>
  );
});
