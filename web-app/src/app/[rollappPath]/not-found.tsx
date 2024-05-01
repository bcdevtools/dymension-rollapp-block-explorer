import Error from '@/components/client/commons/Error';
import LinkBack from '@/components/client/commons/LinkBack';
import { TOOLBAR_HEIGHT, TOOLBAR_MOBILE_HEIGHT } from '@/consts/theme';
import Box from '@mui/material/Box';

function calculateHeight(toolbarHeight: number) {
  return `calc(100vh - 64px - ${toolbarHeight}px)`;
}

export default function NotFound() {
  return (
    <Box
      position="relative"
      height={{
        xs: calculateHeight(TOOLBAR_MOBILE_HEIGHT),
        md: calculateHeight(TOOLBAR_HEIGHT),
      }}
      overflow="hidden">
      <Box
        position="absolute"
        top="50%"
        left="50%"
        overflow="hidden"
        sx={{ transform: 'translate(-50%, -50%)' }}>
        <Error
          //@ts-ignore
          statusCode={'Not found'}
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
