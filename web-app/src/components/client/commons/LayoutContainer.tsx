'use client';

import { TOOLBAR_HEIGHT, TOOLBAR_MOBILE_HEIGHT } from '@/consts/theme';
import { styled } from '@mui/material/styles';
import Container from '@mui/material/Container';

const FOOTER_HEIGHT = 53;

export default styled(Container)(({ theme }) => ({
  minHeight: `calc(100vh - ${TOOLBAR_HEIGHT}px - ${FOOTER_HEIGHT}px)`,
  [theme.breakpoints.down('md')]: {
    minHeight: `calc(100vh - ${TOOLBAR_MOBILE_HEIGHT}px - ${FOOTER_HEIGHT}px)`,
  },
}));
