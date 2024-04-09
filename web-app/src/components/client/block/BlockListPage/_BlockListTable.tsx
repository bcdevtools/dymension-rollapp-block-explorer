import DataTable from '@/components/commons/DataTable';
import { PAGE_PARAM_NAME, PAGE_SIZE_PARAM_NAME } from '@/consts/setting';
import useBlockList from '@/hooks/useBlockList';
import {
  formatUnixTime,
  getStringParamAsNumber,
  getValidPage,
  getValidPageSize,
} from '@/utils/common';
import Link from '@mui/material/Link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import React from 'react';

type BlockListTableProps = Readonly<{
  latestBlockNo: number;
  loadingBlockNo: boolean;
}>;

export default function BlockListTable({
  latestBlockNo,
  loadingBlockNo,
}: BlockListTableProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const pageSize = getValidPageSize(
    getStringParamAsNumber(searchParams.get(PAGE_SIZE_PARAM_NAME))
  );
  const page = getValidPage(
    getStringParamAsNumber(searchParams.get(PAGE_PARAM_NAME)),
    pageSize,
    latestBlockNo
  );

  const [blocks, loading] = useBlockList(latestBlockNo, page, pageSize);

  const body = blocks.map(b => [
    <Link key={b.height} href={`${pathname}/${b.height}`} underline="hover">
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
      loading={loading || loadingBlockNo}
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
