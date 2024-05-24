'use client';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

export default function LoadingBackdrop() {
  return (
    <Backdrop sx={{ color: '#fff', zIndex: theme => theme.zIndex.tooltip + 1 }} open>
      <CircularProgress color="inherit" />
    </Backdrop>
  );
}
