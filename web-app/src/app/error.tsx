'use client';

import Error from '@/components/client/commons/Error';
import ErrorContainer from '@/components/client/commons/RollappErrorContainer';
import Link from '@mui/material/Link';

export default function ErrorLayout({ error }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <ErrorContainer>
      <Error
        //@ts-ignore
        statusCode={error.message}
        //@ts-ignore
        title={<Link href="/">Return Home</Link>}
      />
    </ErrorContainer>
  );
}
