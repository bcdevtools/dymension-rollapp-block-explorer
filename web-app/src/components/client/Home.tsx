'use client';

import Box from '@mui/material/Box';
import Search from './search/Search';

export default function Home() {
  return (
    <Box
      sx={{
        width: { xs: '100vw', sm: '90vw', md: '80vw', lg: '65vw', xl: '50vw' },
        p: 1,
      }}>
      <Search columns={2} />
    </Box>
  );
}
