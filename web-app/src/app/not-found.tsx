import Error from '@/components/client/commons/Error';

export default function NotFound() {
  return <Error statusCode={404} />;
}
