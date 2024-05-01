'use client';

import Error from '@/components/client/commons/Error';
import ErrorContainer from '@/components/client/commons/RollappErrorContainer';
import { Link } from '@mui/material';

export default function ErrorLayout({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorContainer>
      <Error
        //@ts-ignore
        statusCode={'Something went wrong!'}
        //@ts-ignore
        title={
          <Link component="button" onClick={() => reset()}>
            Try again
          </Link>
        }
      />
    </ErrorContainer>
  );
}
