import Skeleton from '@mui/material/Skeleton';

export default function loading() {
  return (
    <>
      <Skeleton variant="text" width={'50%'} sx={{ mb: 1 }} />
      <Skeleton variant="text" width={'100%'} />
      <Skeleton variant="text" width={'100%'} />
      <Skeleton variant="text" width={'60%'} sx={{ mb: 2 }} />
      <Skeleton variant="text" width={'50%'} sx={{ mb: 1 }} />
      <Skeleton variant="text" width={'100%'} />
      <Skeleton variant="text" width={'100%'} />
      <Skeleton variant="text" width={'100%'} />
      <Skeleton variant="text" width={'55%'} />
    </>
  );
}
