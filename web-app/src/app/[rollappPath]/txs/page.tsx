import PageTitle from '@/components/commons/PageTitle';
import TransactionListTable from '@/components/transaction/TransactionListTable';
import { getRollAppInfoByRollappPath } from '@/services/chain.service';
import {
  countTransactionsByHeight,
  getTransactionsByHeight,
} from '@/services/db/transactions';
import {
  SearchParam,
  getValidPageSize,
  getStringParamAsNumber,
  getOffsetFromPageAndPageSize,
  getValidPage,
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

  const total = await countTransactionsByHeight(rollappInfo.chainId, blockNo);

  const pageSize = getValidPageSize(getStringParamAsNumber(searchParams.ps));
  const page = getValidPage(
    getStringParamAsNumber(searchParams.p),
    pageSize,
    total
  );
  const offset = getOffsetFromPageAndPageSize(page, pageSize);

  const transactions = await getTransactionsByHeight(
    rollappInfo.chainId,
    blockNo,
    { limit: pageSize, offset: offset }
  );

  return (
    <>
      <PageTitle title="Transactions" />
      <TransactionListTable
        transactions={transactions}
        totalTransactions={total}
        pageSize={pageSize}
        page={page}
      />
    </>
  );
}
