import DataTable from '@/components/commons/DataTable';
import { Path } from '@/consts/path';
import { Block } from '@/consts/rpcResTypes';
import { PAGE_PARAM_NAME, PAGE_SIZE_PARAM_NAME } from '@/consts/setting';
import useBlockList from '@/hooks/useBlockList';
import {
  formatUnixTime,
  getNewPathByRollapp,
  getPageAndPageSizeFromStringParam,
} from '@/utils/common';
import Link from '@mui/material/Link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import React from 'react';

type BlockListTableProps = Readonly<{
  latestBlockNo: number;
  loadingBlockNo: boolean;
}>;

function getTxsDisplay(blockDetail: Block, pathname: string) {
  const txCount = blockDetail.txs.length;
  return !txCount ? (
    0
  ) : (
    <Link
      href={`${getNewPathByRollapp(pathname, Path.TRANSACTIONS)}?block=${
        blockDetail.height
      }`}
      underline="hover">
      {txCount}
    </Link>
  );
}

export default function BlockListTable({
  latestBlockNo,
  loadingBlockNo,
}: BlockListTableProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [pageSize, page] = getPageAndPageSizeFromStringParam(
    searchParams.get(PAGE_SIZE_PARAM_NAME),
    searchParams.get(PAGE_PARAM_NAME),
    latestBlockNo
  );

  const [blocks, loading] = useBlockList(latestBlockNo, page, pageSize);

  const body = blocks.map(b => [
    <Link key={b.height} href={`${pathname}/${b.height}`} underline="hover">
      {b.height}
    </Link>,
    formatUnixTime(b.timeEpochUTC),
    getTxsDisplay(b, pathname),
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
