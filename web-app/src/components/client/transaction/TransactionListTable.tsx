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
import React, { useEffect, useState } from 'react';
import LinkToBlockNo from '../block/LinkToBlockNo';
import Chip from '@mui/material/Chip';
import { Path } from '@/consts/path';
import { formatUnixTime } from '@/utils/datetime';
import { getMessageName } from '@/utils/transaction';

type TransactionListTableProps = Readonly<{
  transactions: Required<{
    height: bigint;
    hash: string;
    epoch: bigint;
    tx_type: string;
    message_types: string[];
    action: string | null;
  }>[];
  totalTransactions?: number;
  pageSize?: number;
  page?: number;
  enablePagination?: boolean;
}>;

const headers = [
  'Transaction Hash',
  'Method',
  'Msg Types',
  'Block',
  'Date Time',
  'Action',
];

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

  const body = transactions.map(
    ({ hash, epoch, message_types, action, tx_type, height }) => [
      <Link
        key={hash}
        href={getNewPathByRollapp(pathname, `/${Path.TRANSACTIONS}/${hash}`)}
        underline="hover">
        {hash.substring(0, 6)}...{hash.substring(hash.length - 6)}
      </Link>,
      <Chip key={hash} label={tx_type} variant="outlined" />,
      message_types.map((i, idx) => (
        <React.Fragment key={idx}>
          {getMessageName(i)}
          {idx + 1 !== message_types.length && <br />}
        </React.Fragment>
      )),
      <LinkToBlockNo key={hash} blockNo={height.toString()} />,
      formatUnixTime(Number(epoch)),
      action &&
        (function () {
          const splitted = action.split(':');
          return splitted[1] || splitted[0];
        })(),
    ]
  );

  return (
    <DataTable
      headers={headers}
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
