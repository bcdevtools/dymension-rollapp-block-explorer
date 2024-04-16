import Box from '@mui/material/Box';
import _Home from '@/components/client/Home';
import Image from 'next/image';
import Typography from '@mui/material/Typography';
import { APP_NAME } from '@/consts/setting';

export default async function Home() {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      flexDirection="column"
      marginTop={5}
      minHeight={320}
      height="40vh"
      width="100vw">
      <Typography variant="h4" display="flex" alignItems="center">
        <Box display="flex" marginRight={2}>
          <Image src="/logo.svg" alt="logo" width={45} height={45} />
        </Box>
        {APP_NAME}
      </Typography>
      <_Home />
    </Box>
  );
}
