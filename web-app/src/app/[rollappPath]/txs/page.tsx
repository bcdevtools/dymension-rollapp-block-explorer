import LinkToBlockNo from '@/components/client/block/LinkToBlockNo';
import PageTitle from '@/components/commons/PageTitle';
import TransactionListTable from '@/components/client/transaction/TransactionListTable';
import { getRollAppInfoByRollappPath } from '@/services/chain.service';
import { countTransactions, getTransactions } from '@/services/db/transactions';
import {
  SearchParam,
  getNumberFromStringParam,
  getOffsetFromPageAndPageSize,
  getPageAndPageSizeFromStringParam,
} from '@/utils/common';
import Card from '@/components/commons/Card';
import { PAGE_PARAM_NAME, PAGE_SIZE_PARAM_NAME } from '@/consts/setting';
import TransactionListByBlockNo from '@/components/client/transaction/TransactionListByBlockNo';

type TransactionsProps = Readonly<{
  params: { rollappPath: string };
  searchParams: {
    [PAGE_PARAM_NAME]: SearchParam;
    [PAGE_SIZE_PARAM_NAME]: SearchParam;
    block: SearchParam;
  };
}>;

export default async function Transactions({
  params,
  searchParams,
}: TransactionsProps) {
  const rollappInfo = (await getRollAppInfoByRollappPath(params.rollappPath))!;

  const blockNo = getNumberFromStringParam(searchParams.block) || null;

  let transactionListComponent: React.ReactNode;
  if (blockNo === null) {
    const total = await countTransactions(rollappInfo.chain_id);

    const [pageSize, page] = getPageAndPageSizeFromStringParam(
      searchParams[PAGE_SIZE_PARAM_NAME],
      searchParams[PAGE_PARAM_NAME],
      total
    );

    const transactions = await getTransactions(rollappInfo.chain_id, {
      take: pageSize,
      skip: getOffsetFromPageAndPageSize(page, pageSize),
    });
    transactionListComponent = (
      <TransactionListTable
        transactions={transactions}
        totalTransactions={total}
        pageSize={pageSize}
        page={page}
        includeValue
      />
    );
  } else {
    transactionListComponent = <TransactionListByBlockNo blockNo={blockNo} />;
  }

  const subtitle = blockNo ? (
    <>
      For Block <LinkToBlockNo blockNo={blockNo} />
    </>
  ) : null;

  return (
    <>
      <PageTitle title="Transactions" subtitle={subtitle} />

      <Card>{transactionListComponent}</Card>
    </>
  );
}
