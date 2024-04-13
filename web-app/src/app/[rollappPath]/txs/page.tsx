import LinkToBlockNo from '@/components/client/block/LinkToBlockNo';
import PageTitle from '@/components/commons/PageTitle';
import TransactionListTable from '@/components/client/transaction/TransactionListTable';
import { getRollAppInfoByRollappPath } from '@/services/chain.service';
import {
  countTransactionsByHeight,
  getTransactionsByHeight,
} from '@/services/db/transactions';
import {
  SearchParam,
  getNumberFromStringParam,
  getOffsetFromPageAndPageSize,
  getPageAndPageSizeFromStringParam,
} from '@/utils/common';
import Card from '@/components/commons/Card';
import { PAGE_PARAM_NAME, PAGE_SIZE_PARAM_NAME } from '@/consts/setting';

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
  const blockNoParam = getNumberFromStringParam(searchParams.block);
  const blockNo = blockNoParam || null;

  const total = await countTransactionsByHeight(rollappInfo.chainId, blockNo);

  const [pageSize, page] = getPageAndPageSizeFromStringParam(
    searchParams[PAGE_SIZE_PARAM_NAME],
    searchParams[PAGE_PARAM_NAME],
    total
  );
  const offset = getOffsetFromPageAndPageSize(page, pageSize);

  const transactions = await getTransactionsByHeight(
    rollappInfo.chainId,
    blockNo,
    { limit: pageSize, offset: offset }
  );

  const subtitle = blockNo ? (
    <>
      For Block <LinkToBlockNo blockNo={blockNo} />
    </>
  ) : null;

  return (
    <>
      <PageTitle title="Transactions" subtitle={subtitle} />

      <Card>
        <TransactionListTable
          transactions={transactions}
          totalTransactions={total}
          pageSize={pageSize}
          page={page}
        />
      </Card>
    </>
  );
}
