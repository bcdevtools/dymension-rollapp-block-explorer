import BlockDetailPage from '@/components/client/block/BlockDetailPage';
import PageTitle from '@/components/commons/PageTitle';

type BlockProps = Readonly<{
  params: { blockNo: string };
}>;

export default function Block({ params }: BlockProps) {
  return (
    <>
      <PageTitle title="Block detail" />
      <BlockDetailPage blockNo={+params.blockNo} />
    </>
  );
}
