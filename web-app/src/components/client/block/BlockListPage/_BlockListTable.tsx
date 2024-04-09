import DataTable from '@/components/commons/DataTable';
import { PAGE_PARAM_NAME, PAGE_SIZE_PARAM_NAME } from '@/consts/setting';
import useBlockList from '@/hooks/useBlockList';
import {
  formatUnixTime,
  getStringParamAsNumber,
  getValidPageSize,
} from '@/utils/common';
import Link from '@mui/material/Link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import React from 'react';

type BlockListTableProps = Readonly<{
  latestBlockNo: number;
}>;

export default function BlockListTable({ latestBlockNo }: BlockListTableProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const pageSize = getValidPageSize(
    getStringParamAsNumber(searchParams.get(PAGE_SIZE_PARAM_NAME))
  );
  const page = getStringParamAsNumber(searchParams.get(PAGE_PARAM_NAME)) || 0;

  const [blocks, loading] = useBlockList(latestBlockNo, page, pageSize);

  const body = blocks.map(b => [
    <Link href={`${pathname}/${b.height}`} underline="hover">
      {b.height}
    </Link>,
    formatUnixTime(b.timeEpochUTC),
    b.txs.length,
  ]);

  return (
    <DataTable
      headers={['Block', 'Date Time', 'Txs']}
      rowKeys={blocks.map(b => b.height)}
      body={body}
      page={page}
      pageSize={pageSize}
      onPageChange={newPage => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set(PAGE_PARAM_NAME, newPage.toString());
        router.push(`${pathname}?${newSearchParams.toString()}`, {
          scroll: false,
        });
      }}
      onRowsPerPageChange={newPageSize => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set(PAGE_SIZE_PARAM_NAME, newPageSize);
        router.push(`${pathname}?${newSearchParams.toString()}`, {
          scroll: false,
        });
      }}
      total={latestBlockNo}
    />
  );
}
