'use client';

import Snackbar from '@mui/material/Snackbar';
import ErrorContext from '@/contexts/ErrorContext';

export function ErrorSnackbar() {
  return (
    <ErrorContext.Consumer>
      {errorContext => (
        <Snackbar
          open={errorContext.isShowErrorSnackbar}
          autoHideDuration={5000}
          onClose={errorContext.closeErrorSnackbar}
          message={errorContext.message}
          ContentProps={{
            sx: { backgroundColor: 'rgb(211, 47, 47)' },
          }}
        />
      )}
    </ErrorContext.Consumer>
  );
}
