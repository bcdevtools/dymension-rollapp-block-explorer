import PageTitle from '@/components/commons/PageTitle';
import TransactionListTable from '@/components/transaction/TransactionListTable';
import { getRollAppInfoByRollappPath } from '@/services/chain.service';
import { getTransactionsByHeight } from '@/services/db/transactions';
import {
  SearchParam,
  getValidPageSize,
  getStringParamAsNumber,
  getOffsetFromPageAndPageSize,
} from '@/utils/common';

type TransactionsProps = Readonly<{
  params: { rollappPath: string };
  searchParams: { p: SearchParam; ps: SearchParam; block: SearchParam };
}>;

export default async function Transactions({
  params,
  searchParams,
}: TransactionsProps) {
  const rollappInfo = await getRollAppInfoByRollappPath(params.rollappPath);
  if (!rollappInfo) return null;
  const blockNoParam = getStringParamAsNumber(searchParams.block);
  const blockNo = blockNoParam > 0 ? blockNoParam : null;

  const pageSize = getValidPageSize(getStringParamAsNumber(searchParams.ps));
  const page = getStringParamAsNumber(searchParams.p);
  const offset = getOffsetFromPageAndPageSize(page, pageSize);

  const transactionsResult = await getTransactionsByHeight(
    rollappInfo.chainId,
    blockNo,
    { limit: pageSize, offset: offset }
  );

  return (
    <>
      <PageTitle title="Transactions" />
      <TransactionListTable
        transactions={transactionsResult.data}
        totalTransactions={transactionsResult.total}
        pageSize={pageSize}
        page={isNaN(page) ? 0 : page}
      />
    </>
  );
}
