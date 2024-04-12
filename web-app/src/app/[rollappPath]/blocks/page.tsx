import PageTitle from '@/components/commons/PageTitle';
import BlockListPage from '@/components/client/block/BlockListPage';
import Card from '@/components/commons/Card';

export default async function Blocks() {
  return (
    <>
      <PageTitle title="Blocks" />
      <Card>
        <BlockListPage />
      </Card>
    </>
  );
}
