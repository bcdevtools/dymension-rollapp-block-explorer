'use client';

import { getNewPathByRollapp } from '@/utils/common';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import DataTable from '../../commons/DataTable';
import {
  DEFAULT_PAGINATION_SIZE,
  PAGE_PARAM_NAME,
  PAGE_SIZE_PARAM_NAME,
} from '@/consts/setting';
import React, { useEffect, useMemo, useState } from 'react';
import LinkToBlockNo from '../block/LinkToBlockNo';
import Chip from '@mui/material/Chip';
import { Path } from '@/consts/path';
import { getMessageName, getShortTxHash } from '@/utils/transaction';
import Link from '@/components/commons/Link';
import useDenomsMetadata from '@/hooks/useDenomsMetadata';
import Typography from '@mui/material/Typography';
import { formatBlockchainAmount } from '@/utils/number';
import DateWithTooltip from '@/components/commons/DateWithTooltip';
import MuiLink from '@mui/material/Link';

export type TransactionFields = Required<{
  height: bigint | number;
  hash: string;
  epoch: bigint | number;
  tx_type: string;
  message_types: string[];
  action: string | null;
}> &
  Partial<{ value: string[] }>;

export type TransactionListTableProps = Readonly<{
  transactions: TransactionFields[];
  totalTransactions?: number;
  pageSize?: number;
  page?: number;
  enablePagination?: boolean;
  loading?: boolean;
  includeValue?: boolean;
  autoRefresh?: boolean;
}>;

export const enum TxTableHeader {
  TRANSACTION_HASH = 'Transaction Hash',
  MESSAGES = 'Messages',
  VALUE = 'Value',
  BLOCK = 'Block',
  DATE_TIME = 'Date Time',
  Age = 'Age',
}

export default function TransactionListTable({
  transactions,
  totalTransactions = 0,
  pageSize = DEFAULT_PAGINATION_SIZE,
  page = 0,
  enablePagination = true,
  loading = false,
  includeValue = false,
  autoRefresh = false,
}: TransactionListTableProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [_loading, setLoading] = useState(false);
  const [showDateTime, setShowDateTime] = useState(true);
  const [denomsMetadata, denomsMetadataLoading] = useDenomsMetadata();

  useEffect(() => {
    setLoading(false);
  }, [transactions]);

  useEffect(() => {
    if (autoRefresh) {
      const intervalId = setInterval(() => router.refresh(), 10000);

      return () => clearInterval(intervalId);
    }
  }, [router, autoRefresh]);

  const body = transactions.map(
    ({ hash, epoch, message_types, action, tx_type, height, value }) => {
      const cells = [];

      // Transaction Hash

      cells.push(
        <Link
          key={`${hash}_txHash`}
          href={getNewPathByRollapp(pathname, `/${Path.TRANSACTION}/${hash}`)}>
          {getShortTxHash(hash)}
        </Link>
      );

      // Messages
      cells.push(getMessageLabel(hash, message_types, action, tx_type));

      // Value
      if (includeValue) {
        if (!value || !value.length) cells.push('-');
        else {
          let hasSomeToken = false;
          const valueDisplay: React.ReactNode[] = [];
          for (let i = 0; i < value.length; i++) {
            const v = value[i];
            const [amount, denom] = v.split(' ');
            if (denomsMetadata[denom]) {
              valueDisplay.push(
                <Typography
                  key={valueDisplay.length}>{`${formatBlockchainAmount(
                  amount,
                  denomsMetadata[denom].highestExponent
                )} ${denomsMetadata[denom].symbol}`}</Typography>
              );
            } else {
              hasSomeToken = true;
              continue;
            }
          }
          if (hasSomeToken) {
            valueDisplay.push(
              <Typography
                key={valueDisplay.length}
                fontStyle="italic"
                fontSize="0.7rem"
                color="text.secondary">
                some token
              </Typography>
            );
          }
          cells.push(valueDisplay);
        }
      }

      // Block height
      cells.push(
        <LinkToBlockNo key={`${hash}_height`} blockNo={height.toString()} />
      );

      // Date Time
      cells.push(
        <DateWithTooltip
          key={`${hash}_time`}
          showDateTime={showDateTime}
          unixTimestamp={Number(epoch)}
          onClick={() => setShowDateTime(s => !s)}
        />
      );

      return cells;
    }
  );

  const headers = useMemo(() => {
    const headers = [];
    headers.push(TxTableHeader.TRANSACTION_HASH);
    headers.push(TxTableHeader.MESSAGES);
    if (includeValue) headers.push(TxTableHeader.VALUE);
    headers.push(TxTableHeader.BLOCK);
    headers.push(
      <MuiLink
        key="mui-link"
        component="button"
        underline="none"
        onClick={() => setShowDateTime(s => !s)}>
        {showDateTime ? TxTableHeader.DATE_TIME : TxTableHeader.Age}
      </MuiLink>
    );

    return headers;
  }, [includeValue, showDateTime]);

  return (
    <DataTable
      headers={headers}
      body={body}
      rowKeys={transactions.map(transaction => transaction.hash)}
      total={totalTransactions}
      page={page}
      pageSize={pageSize}
      loading={loading || _loading || (includeValue && denomsMetadataLoading)}
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
          <Chip
            key={`${hash}_message`}
            label={label}
            color="info"
            variant="outlined"
          />
        );
      } else if (tx_type === 'wasm') {
        return (
          <Chip
            key={`${hash}_message`}
            label={label}
            color="secondary"
            variant="outlined"
          />
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
