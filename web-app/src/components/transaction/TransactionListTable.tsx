'use client';

import { transaction } from '@prisma/client';
import { formatUnixTime, getNewPathByRollapp } from '@/utils/common';
import Link from '@mui/material/Link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Path } from '@/consts/path';
import DataTable from '../commons/DataTable';
import { PAGE_PARAM_NAME, PAGE_SIZE_PARAM_NAME } from '@/consts/setting';

type TransactionListTableProps = Readonly<{
  transactions: transaction[];
  totalTransactions: number;
  pageSize: number;
  page: number;
}>;

export default function TransactionListTable({
  transactions,
  totalTransactions,
  pageSize,
  page,
}: TransactionListTableProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const body = transactions.map(transaction => [
    <Link href={`${pathname}/${transaction.hash}`} underline="hover">
      {transaction.hash}
    </Link>,
    transaction.tx_type,
    <Link
      href={`${getNewPathByRollapp(pathname, Path.BLOCKS)}/${
        transaction.height
      }`}
      underline="hover">
      {transaction.height.toString()}
    </Link>,
    formatUnixTime(Number(transaction.epoch)),
  ]);

  return (
    <DataTable
      headers={['TxHash', 'Method', 'Block', 'Date Time']}
      body={body}
      rowKeys={transactions.map(transaction => transaction.hash)}
      total={totalTransactions}
      page={page}
      pageSize={pageSize}
      onPageChange={newPage => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set(PAGE_PARAM_NAME, newPage.toString());
        router.push(`${pathname}?${newSearchParams.toString()}`);
      }}
      onRowsPerPageChange={newPageSize => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set(PAGE_SIZE_PARAM_NAME, newPageSize);
        router.push(`${pathname}?${newSearchParams.toString()}`);
      }}
    />
  );
}
