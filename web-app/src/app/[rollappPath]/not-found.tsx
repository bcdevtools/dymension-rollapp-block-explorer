import Error from '@/components/client/commons/Error';
import LinkBack from '@/components/client/commons/LinkBack';
import ErrorContainer from '@/components/client/commons/RollappErrorContainer';

export default function NotFound() {
  return (
    <ErrorContainer>
      <Error
        //@ts-expect-error error.message might not be a number
        statusCode={'Not found'}
        //@ts-expect-error title might not expect a JSX element
        title={
          <>
            Could not find requested resource. <LinkBack />
          </>
        }
      />
    </ErrorContainer>
  );
}
