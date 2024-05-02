import Error from '@/components/client/commons/Error';
import LinkBack from '@/components/client/commons/LinkBack';
import ErrorContainer from '@/components/client/commons/RollappErrorContainer';

export default function NotFound() {
  return (
    <ErrorContainer>
      <Error
        //@ts-ignore
        statusCode={'Not found'}
        //@ts-ignore
        title={
          <>
            Could not find requested resource. <LinkBack />
          </>
        }
      />
    </ErrorContainer>
  );
}
