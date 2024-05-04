'use client';

import { getNewPathByRollapp } from '@/utils/common';
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
import Link from '@/components/commons/Link';

type TransactionListTableProps = Readonly<{
  transactions: Required<{
    height: bigint | number;
    hash: string;
    epoch: bigint | number;
    tx_type: string;
    message_types: string[];
    action: string | null;
  }>[];
  totalTransactions?: number;
  pageSize?: number;
  page?: number;
  enablePagination?: boolean;
  loading?: boolean;
}>;

const headers = ['Transaction Hash', 'Messages', 'Block', 'Date Time'];

export default function TransactionListTable({
  transactions,
  totalTransactions = 0,
  pageSize = DEFAULT_PAGINATION_SIZE,
  page = 0,
  enablePagination = true,
  loading = false,
}: TransactionListTableProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [_loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, [transactions]);

  const body = transactions.map(
    ({ hash, epoch, message_types, action, tx_type, height }) => {
      const cells = [];

      // Transaction Hash

      cells.push(
        <Link
          key={hash}
          href={getNewPathByRollapp(pathname, `/${Path.TRANSACTION}/${hash}`)}>
          {hash.substring(0, 6)}...{hash.substring(hash.length - 6)}
        </Link>
      );

      // Messages

      cells.push(getMessageLabel(hash, message_types, action, tx_type));

      // Block height

      cells.push(<LinkToBlockNo key={hash} blockNo={height.toString()} />);

      // Date Time

      cells.push(formatUnixTime(Number(epoch)));

      return cells;
    }
  );

  return (
    <DataTable
      headers={headers}
      body={body}
      rowKeys={transactions.map(transaction => transaction.hash)}
      total={totalTransactions}
      page={page}
      pageSize={pageSize}
      loading={loading || _loading}
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

const getMessageLabel = function (
  hash: string,
  message_types: string[],
  action: string | null,
  tx_type: string
) {
  if (action) {
    const splitted = action.split(':');
    const label = splitted[1] || splitted[0];
    if (label) {
      if (tx_type === 'evm') {
        return (
          <Chip key={hash} label={label} color="info" variant="outlined" />
        );
      } else if (tx_type === 'wasm') {
        return (
          <Chip key={hash} label={label} color="secondary" variant="outlined" />
        );
      }
    }
  }

  const messages = Array.from(new Set(message_types.map(getMessageName)));

  return messages.map((i, idx) => (
    <React.Fragment key={i}>
      <Chip label={i} color="default" variant="outlined" />
      {idx + 1 !== messages.length && <br />}
    </React.Fragment>
  ));
};
