import BlockDetailPage from '@/components/client/block/BlockDetailPage';
import TransactionListByBlockNo from '@/components/client/transaction/TransactionListByBlockNo';
import Card from '@/components/commons/Card';
import PageTitle from '@/components/commons/PageTitle';
import { isBlockNo } from '@/utils/common';
import { redirect } from 'next/navigation';

type BlockProps = Readonly<{
  params: { blockNo: string; rollappPath: string };
}>;

export default function Block({ params }: BlockProps) {
  if (!isBlockNo(params.blockNo)) return redirect(`/${params.rollappPath}`);

  return (
    <>
      <PageTitle title="Block detail" />
      <Card sx={{ mb: 3 }}>
        <BlockDetailPage />
      </Card>
      <Card>
        <TransactionListByBlockNo
          blockNo={+params.blockNo}
          showPaginationOnTop={false}
        />
      </Card>
    </>
  );
}
