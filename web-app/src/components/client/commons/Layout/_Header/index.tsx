'use client';

import { styled } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import ThemeToggleButton from './_ThemeToggleButton';
import Logo from './_Logo';
import SearchIcon from '@mui/icons-material/Search';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import React from 'react';
import { TOOLBAR_MOBILE_HEIGHT } from '@/consts/theme';
import { SEARCH_PLACEHOLDER } from '@/consts/setting';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    zIndex: theme.zIndex.drawer + 1,
  },
}));

export const CustomToolbar = styled(Toolbar)(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    minHeight: TOOLBAR_MOBILE_HEIGHT,
  },
}));

const StyledToolbar = styled(CustomToolbar)(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(2),
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  [theme.breakpoints.up('md')]: {
    marginLeft: theme.spacing(1),
    width: '50ch',
  },
  [theme.breakpoints.down('md')]: {
    order: 1,
  },
}));

type HeaderProps = Readonly<{
  handleMenuToggle: () => void;
  openSearch: () => void;
}>;

export default React.memo(function Header({
  handleMenuToggle,
  openSearch,
}: HeaderProps) {
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
        <StyledTextField
          placeholder={SEARCH_PLACEHOLDER}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          size="small"
          onClick={openSearch}
          inputRef={(e: HTMLInputElement) => e && e.blur()}
          sx={{ input: { cursor: 'pointer' } }}
        />
        <ThemeToggleButton />
      </StyledToolbar>
    </StyledAppBar>
  );
});
