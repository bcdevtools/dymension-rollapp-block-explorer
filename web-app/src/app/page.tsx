import Box from '@mui/material/Box';
import HomeSearch from '@/components/client/HomeSearch';
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
      minHeight={250}
      height="30vh"
      width="100vw">
      <Typography variant="h4" display="flex" alignItems="center">
        <Box display="flex" marginRight={2}>
          <Image src="/logo.svg" alt="logo" width={45} height={45} />
        </Box>
        {APP_NAME}
      </Typography>
      <HomeSearch />
    </Box>
  );
}
