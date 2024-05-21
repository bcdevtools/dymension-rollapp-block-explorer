import DataTable from '@/components/commons/DataTable';
import Link from '@/components/commons/Link';
import { Path } from '@/consts/path';
import { RecentBlock } from '@/consts/rpcResTypes';
import { PAGE_PARAM_NAME, PAGE_SIZE_PARAM_NAME } from '@/consts/setting';
import { getNewPathByRollapp } from '@/utils/common';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import LinkToBlockNo from '../LinkToBlockNo';
import { getShortAddress } from '@/utils/address';
import MuiLink from '@mui/material/Link';
import DateWithTooltip from '@/components/commons/DateWithTooltip';
import { RecentBlocksHookResult } from '@/hooks/useRecentBlocks';

type BlockListTableProps = Readonly<{
  recentBlocks: RecentBlocksHookResult | null;
  recentBlocksLoading: boolean;
  page: number;
  pageSize: number;
}>;

function getTxsDisplay(blockDetail: RecentBlock, pathname: string) {
  const { txsCount } = blockDetail;
  return !txsCount ? (
    0
  ) : (
    <Link
      href={`${getNewPathByRollapp(pathname, Path.TRANSACTIONS)}?block=${
        blockDetail.height
      }`}>
      {txsCount}
    </Link>
  );
}

export default function BlockListTable({
  recentBlocks,
  recentBlocksLoading,
  page,
  pageSize,
}: BlockListTableProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const router = useRouter();
  const [showDateTime, setShowDateTime] = useState(false);

  const blocks = recentBlocks?.blocks || [];

  const body = blocks.map(b => {
    const { height } = b;
    return [
      <LinkToBlockNo key={height} blockNo={height} />,
      <DateWithTooltip
        key={`${height}_time`}
        showDateTime={showDateTime}
        unixTimestamp={b.timeEpochUTC}
        onClick={() => setShowDateTime(s => !s)}
      />,
      b.proposer
        ? b.proposer.moniker || getShortAddress(b.proposer.consensusAddress)
        : '-',
      getTxsDisplay(b, pathname),
    ];
  });

  return (
    <DataTable
      headers={[
        'Block',
        <MuiLink
          key="mui-link"
          component="button"
          underline="none"
          onClick={() => setShowDateTime(s => !s)}>
          {showDateTime ? 'Date Time' : 'Age'}
        </MuiLink>,
        'Proposer',
        'Txs',
      ]}
      rowKeys={recentBlocks?.blocks.map(b => b.height) || []}
      body={body}
      page={page}
      pageSize={pageSize}
      loading={recentBlocksLoading}
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
      total={recentBlocks?.latestBlock}
    />
  );
}
