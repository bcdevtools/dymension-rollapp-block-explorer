import PageTitle from '@/components/server/commons/PageTitle';
import BlockContent from '@/components/client/block/Content';

export default async function Blocks() {
  return (
    <>
      <PageTitle title="Blocks" />
      <BlockContent />
    </>
  );
}
