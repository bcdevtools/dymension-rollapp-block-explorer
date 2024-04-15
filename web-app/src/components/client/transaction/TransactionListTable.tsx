'use client';

import { getNewPathByRollapp } from '@/utils/common';
import Link from '@mui/material/Link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import DataTable from '../../commons/DataTable';
import {
  DEFAULT_PAGINATION_SIZE,
  PAGE_PARAM_NAME,
  PAGE_SIZE_PARAM_NAME,
} from '@/consts/setting';
import { useEffect, useState } from 'react';
import LinkToBlockNo from '../block/LinkToBlockNo';
import Chip from '@mui/material/Chip';
import { Path } from '@/consts/path';
import { formatUnixTime } from '@/utils/datetime';

type TransactionListTableProps = Readonly<{
  transactions: Required<{
    height: bigint;
    hash: string;
    epoch: bigint;
    tx_type: string;
  }>[];
  totalTransactions?: number;
  pageSize?: number;
  page?: number;
  enablePagination?: boolean;
}>;

export default function TransactionListTable({
  transactions,
  totalTransactions = 0,
  pageSize = DEFAULT_PAGINATION_SIZE,
  page = 0,
  enablePagination = true,
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
      href={getNewPathByRollapp(
        pathname,
        `/${Path.TRANSACTIONS}/${transaction.hash}`
      )}
      underline="hover">
      {transaction.hash}
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
      enablePagination={enablePagination}
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
        router.push(`${pathname}?${newSearchParams.toString()}`, {
          scroll: false,
        });
      }}
    />
  );
}
