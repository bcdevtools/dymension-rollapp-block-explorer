import Error from '@/components/client/commons/Error';
import Link from '@/components/commons/Link';

export default function NotFound() {
  return (
    <Error
      statusCode={404}
      //@ts-ignore
      title={
        <>
          Could not find requested resource. <Link href="/">Return Home</Link>
        </>
      }
    />
  );
}
