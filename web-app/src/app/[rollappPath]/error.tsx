'use client';

import Error from '@/components/client/commons/Error';
import ErrorContainer from '@/components/client/commons/RollappErrorContainer';
import { useMountedState } from '@/hooks/useMountedState';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import { useState } from 'react';

export default function ErrorLayout({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [retrying, setRetrying] = useState(false);
  const mounted = useMountedState();

  return (
    <ErrorContainer>
      <Error
        //@ts-ignore
        statusCode={error.message}
        //@ts-ignore
        title={
          !retrying ? (
            <Link
              component="button"
              onClick={() => {
                setRetrying(true);
                console.log('retryinggg');
                setTimeout(() => {
                  reset();
                }, 1000);
                setTimeout(() => {
                  if (mounted.current) setRetrying(false);
                }, 2000);
              }}>
              Try again
            </Link>
          ) : (
            <CircularProgress />
          )
        }
      />
    </ErrorContainer>
  );
}
