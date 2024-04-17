import Error from '@/components/client/commons/Error';
import Link from '@mui/material/Link';

export default function NotFound() {
  return (
    <Error
      statusCode={404}
      //@ts-ignore
      title={
        <>
          Could not find requested resource.{' '}
          <Link href="/" underline="hover">
            Return Home
          </Link>
        </>
      }
    />
  );
}
