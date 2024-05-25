'use client';

import Error from '@/components/client/commons/Error';
import ErrorContainer from '@/components/client/commons/RollappErrorContainer';
import Link from '@mui/material/Link';

export default function ErrorLayout({ error }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <ErrorContainer>
      <Error
        //@ts-expect-error error.message might not be a number
        statusCode={error.message}
        //@ts-expect-error title might not expect a JSX element
        title={<Link href="/">Return Home</Link>}
      />
    </ErrorContainer>
  );
}
