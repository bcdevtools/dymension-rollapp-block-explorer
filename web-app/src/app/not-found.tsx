import Error from '@/components/client/commons/Error';
import Link from '@/components/commons/Link';

export default function NotFound() {
  return (
    <Error
      statusCode={404}
      //@ts-expect-error title might not expect a JSX element
      title={
        <>
          Could not find requested resource. <Link href="/">Return Home</Link>
        </>
      }
    />
  );
}
