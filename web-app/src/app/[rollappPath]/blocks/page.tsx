import PageTitle from '@/components/commons/PageTitle';
import BlockListPage from '@/components/client/block/BlockListPage';

export default async function Blocks() {
  return (
    <>
      <PageTitle title="Blocks" />
      <BlockListPage />
    </>
  );
}
