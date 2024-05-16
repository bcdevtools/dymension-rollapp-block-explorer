import BlockDetailPage from '@/components/client/block/BlockDetailPage';
import Card from '@/components/commons/Card';
import PageTitle from '@/components/commons/PageTitle';
import { redirect } from 'next/navigation';

type BlockProps = Readonly<{
  params: { blockNo: string; rollappPath: string };
}>;

export default function Block({ params }: BlockProps) {
  if (!/^\d+$|^(0x)?[\da-fA-F]+$/.test(params.blockNo))
    return redirect(`/${params.rollappPath}`);

  return (
    <>
      <PageTitle title="Block detail" />
      <Card>
        <BlockDetailPage />
      </Card>
    </>
  );
}
