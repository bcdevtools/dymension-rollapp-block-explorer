import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

export default function DefaultLoading() {
  return (
    <Box display="flex" justifyContent="center" width="100%" padding={1}>
      <CircularProgress />
    </Box>
  );
}
