'use client';

import { Roboto } from 'next/font/google';
import {
  ThemeOptions,
  createTheme,
  ThemeProvider as _ThemeProvider,
} from '@mui/material/styles';
import { THEME_COOKIE_NAME, ThemeMode } from '@/consts/theme';
import { forwardRef, useState } from 'react';
import Link from 'next/link';
import ThemeContext from '@/contexts/ThemeContext';
import CssBaseline from '@mui/material/CssBaseline';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const baseThemeOptions: ThemeOptions = {
  typography: { fontFamily: roboto.style.fontFamily },
  components: {
    MuiLink: {
      defaultProps: {
        // eslint-disable-next-line react/display-name
        component: forwardRef((props, ref) => <Link ref={ref} {...props} />),
      },
    },
  },
};

const themes = {
  [ThemeMode.LIGHT]: createTheme({
    ...baseThemeOptions,
    palette: {
      mode: ThemeMode.LIGHT,
      // background: { default: '#f8fafb' }
    },
  }),
  [ThemeMode.DARK]: createTheme({
    ...baseThemeOptions,
    palette: {
      mode: ThemeMode.DARK,
      // background: {
      //   default: '#13171b',
      // },
    },
  }),
};

type ThemeProviderProps = Readonly<{
  initialThemeMode: ThemeMode;
  children: React.ReactNode;
}>;

export default function ThemeProvider({
  initialThemeMode,
  children,
}: ThemeProviderProps) {
  const [theme, setTheme] = useState(initialThemeMode);

  const handleThemeToggle = () => {
    const newTheme =
      theme === ThemeMode.LIGHT ? ThemeMode.DARK : ThemeMode.LIGHT;
    setTheme(newTheme);
    document.cookie = `${THEME_COOKIE_NAME}=${newTheme}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;
  };

  return (
    <ThemeContext.Provider value={{ handleThemeToggle }}>
      <_ThemeProvider theme={themes[theme]}>
        <CssBaseline />
        {children}
      </_ThemeProvider>
    </ThemeContext.Provider>
  );
}
