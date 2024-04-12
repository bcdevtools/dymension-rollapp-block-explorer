import PageTitle from '@/components/commons/PageTitle';
import TransactionDetailPage from '@/components/client/transaction/TransactionDetailPage';
import Card from '@/components/commons/Card';

type TransactionsProps = Readonly<{
  params: { txHash: string };
}>;

export default function Transaction({ params }: TransactionsProps) {
  return (
    <>
      <PageTitle title="Transaction" />
      <Card>
        <TransactionDetailPage />
      </Card>
    </>
  );
}
