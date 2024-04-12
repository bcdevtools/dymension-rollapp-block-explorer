import BlockDetailPage from '@/components/client/block/BlockDetailPage';
import Card from '@/components/commons/Card';
import PageTitle from '@/components/commons/PageTitle';

type BlockProps = Readonly<{
  params: { blockNo: string };
}>;

export default function Block({ params }: BlockProps) {
  return (
    <>
      <PageTitle title="Block detail" />
      <Card>
        <BlockDetailPage />
      </Card>
    </>
  );
}
