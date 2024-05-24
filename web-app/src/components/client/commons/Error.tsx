'use client';

import { ThemeMode } from '@/consts/theme';
import { useTheme } from '@mui/material/styles';
import ErrorPage, { ErrorProps } from 'next/error';

export default function Error(props: ErrorProps) {
  const theme = useTheme();
  return <ErrorPage {...props} withDarkMode={theme.palette.mode === ThemeMode.DARK} />;
}
