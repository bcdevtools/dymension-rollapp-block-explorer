import Error from '@/components/client/commons/Error';
import { TOOLBAR_HEIGHT, TOOLBAR_MOBILE_HEIGHT } from '@/consts/theme';
import Box from '@mui/material/Box';

function calculateHeight(toolbarHeight: number) {
  return `calc(100vh - 98px - ${toolbarHeight}px)`;
}

export default function NotFound() {
  return (
    <Box
      position="relative"
      height={{
        xs: calculateHeight(TOOLBAR_MOBILE_HEIGHT),
        md: calculateHeight(TOOLBAR_HEIGHT),
      }}>
      <Box
        position="absolute"
        margin={0}
        top="50%"
        left="50%"
        sx={{ transform: 'translate(-50%, -50%)' }}>
        <Error statusCode={404} />
      </Box>
    </Box>
  );
}
