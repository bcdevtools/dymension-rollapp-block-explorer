'use client';

import { Roboto } from 'next/font/google';
import { ThemeOptions, createTheme } from '@mui/material/styles';
import { ThemeMode } from '@/consts/theme';
import { forwardRef } from 'react';
import Link from 'next/link';

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
        component: forwardRef((props, ref) => <Link ref={ref} {...props} />),
      },
    },
  },
};

const themes = {
  [ThemeMode.LIGHT]: createTheme({
    ...baseThemeOptions,
    palette: { mode: ThemeMode.LIGHT },
  }),
  [ThemeMode.DARK]: createTheme({
    ...baseThemeOptions,
    palette: { mode: ThemeMode.DARK },
  }),
};

export default themes;
