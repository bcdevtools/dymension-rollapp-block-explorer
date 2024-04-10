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
        // eslint-disable-next-line react/display-name
        component: forwardRef((props, ref) => <Link ref={ref} {...props} />),
      },
    },
  },
};

const themes = {
  [ThemeMode.LIGHT]: createTheme({
    ...baseThemeOptions,
    palette: { mode: ThemeMode.LIGHT, background: { default: '#f8fafb' } },
  }),
  [ThemeMode.DARK]: createTheme({
    ...baseThemeOptions,
    palette: {
      mode: ThemeMode.DARK,
      background: {
        default: '#13171b',
      },
    },
  }),
};

export default themes;
