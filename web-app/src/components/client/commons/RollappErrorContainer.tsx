import { TOOLBAR_HEIGHT, TOOLBAR_MOBILE_HEIGHT } from '@/consts/theme';
import Box from '@mui/material/Box';
import React from 'react';

function calculateHeight(toolbarHeight: number) {
  return `calc(100vh - 64px - ${toolbarHeight}px)`;
}

export default function ErrorContainer({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <Box
      position="relative"
      height={{
        xs: calculateHeight(TOOLBAR_MOBILE_HEIGHT),
        md: calculateHeight(TOOLBAR_HEIGHT),
      }}
      overflow="hidden">
      <Box position="absolute" top="50%" left="50%" overflow="hidden" sx={{ transform: 'translate(-50%, -50%)' }}>
        {children}
      </Box>
    </Box>
  );
}
