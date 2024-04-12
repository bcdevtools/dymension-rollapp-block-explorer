import Error from '@/components/client/commons/Error';
import LinkBack from '@/components/client/commons/LinkBack';
import { TOOLBAR_HEIGHT, TOOLBAR_MOBILE_HEIGHT } from '@/consts/theme';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';

function calculateHeight(toolbarHeight: number) {
  return `calc(100vh - 106px - ${toolbarHeight}px)`;
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
        top="50%"
        left="50%"
        sx={{ transform: 'translate(-50%, -50%)' }}>
        <Error
          //@ts-ignore
          statusCode={'Search not found'}
          //@ts-ignore
          title={
            <>
              Could not find requested resource. <LinkBack />
            </>
          }
        />
      </Box>
    </Box>
  );
}
