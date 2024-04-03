'use client';

import Box from '@mui/material/Box';
import Header, { CustomToolbar } from './_Header';
import Sider from './_Sider';
import React, { useRef, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import themes from '@/utils/themes';
import ThemeContext from '@/contexts/ThemeContext';
import { THEME_COOKIE_NAME, ThemeMode } from '@/consts/theme';

const SIDER_WIDTH = 240;

type LayoutProps = Readonly<{
  children: React.ReactNode;
  initialThemeMode: ThemeMode;
}>;

export default function Layout({ children, initialThemeMode }: LayoutProps) {
  const [theme, setTheme] = useState(initialThemeMode);
  const [menuOpen, setMenuOpen] = useState(false);
  // const [isClosing, setIsClosing] = useState(false);
  const isClosing = useRef(false);

  const handleThemeToggle = () => {
    const newTheme =
      theme === ThemeMode.LIGHT ? ThemeMode.DARK : ThemeMode.LIGHT;
    setTheme(newTheme);
    document.cookie = `${THEME_COOKIE_NAME}=${newTheme}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;
  };

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
    <ThemeContext.Provider value={{ theme, handleThemeToggle }}>
      <ThemeProvider theme={themes[theme]}>
        <CssBaseline />
        <Box display="flex">
          <Header handleMenuToggle={handleMenuToggle} />
          <Sider
            width={SIDER_WIDTH}
            menuOpen={menuOpen}
            handleMenuClose={handleMenuClose}
            handleDrawerTransitionEnd={handleDrawerTransitionEnd}
          />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              width: { md: `calc(100vh - ${SIDER_WIDTH}px)` },
              height: {
                xs: `calc(100vh - ${128}px)`,
                md: `calc(100vh - ${64}px)`,
              },
            }}>
            <CustomToolbar />
            {children}
          </Box>
        </Box>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}
