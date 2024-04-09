'use client';

import { transaction } from '@prisma/client';
import { formatUnixTime } from '@/utils/common';
import Link from '@mui/material/Link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import DataTable from '../commons/DataTable';
import { PAGE_PARAM_NAME, PAGE_SIZE_PARAM_NAME } from '@/consts/setting';
import { useEffect, useState } from 'react';
import LinkToBlockNo from '../client/block/LinkToBlockNo';
import Chip from '@mui/material/Chip';

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, [transactions]);

  const body = transactions.map(transaction => [
    <Link
      key={transaction.hash}
      href={`${pathname}/${transaction.hash}`}
      underline="hover">
      0x{transaction.hash.toLowerCase()}
    </Link>,
    <Chip
      key={transaction.hash}
      label={transaction.tx_type}
      variant="outlined"
    />,
    <LinkToBlockNo
      key={transaction.hash}
      blockNo={transaction.height.toString()}
    />,
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
      loading={loading}
      onPageChange={newPage => {
        setLoading(true);
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set(PAGE_PARAM_NAME, newPage.toString());
        router.push(`${pathname}?${newSearchParams.toString()}`, {
          scroll: false,
        });
      }}
      onRowsPerPageChange={newPageSize => {
        setLoading(true);
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set(PAGE_SIZE_PARAM_NAME, newPageSize);
        router.push(`${pathname}?${newSearchParams.toString()}`);
      }}
    />
  );
}
