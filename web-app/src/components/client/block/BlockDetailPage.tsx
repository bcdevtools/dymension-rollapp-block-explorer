'use client';

import useBlockDetail from '@/hooks/useBlockDetail';
import { getNewPathByRollapp } from '@/utils/common';
import Link from '@mui/material/Link';
import { Block } from '@/consts/rpcResTypes';
import { useParams, usePathname } from 'next/navigation';
import { Path } from '@/consts/path';
import { formatUnixTime } from '@/utils/datetime';
import { DetailItem } from '@/components/commons/DetailItem';
import Grid from '@mui/material/Grid';

function getTxsDisplay(blockDetail: Block, pathname: string) {
  const txCount = blockDetail.txs.length;
  return txCount ? (
    <Link
      href={`${getNewPathByRollapp(pathname, Path.TRANSACTIONS)}?block=${
        blockDetail.height
      }`}
      underline="hover">
      {txCount} transacion{txCount > 1 && 's'}
    </Link>
  ) : (
    '0 transaction'
  );
}

export default function BlockDetailPage() {
  const params = useParams<{ blockNo: string }>();
  const blockNo = parseInt(params.blockNo);
  const [blockDetail, loading] = useBlockDetail(blockNo);
  const pathname = usePathname();

  if (loading) return null;
  if (!blockDetail) return null;

  const txsDisplay = getTxsDisplay(blockDetail, pathname);
  return (
    <Grid container spacing={1}>
      <DetailItem label="Block height" value={blockNo} />
      <DetailItem
        label="Date Time"
        value={formatUnixTime(blockDetail.timeEpochUTC)}
      />
      <DetailItem label="Transactions" value={`${txsDisplay} in this block`} />
    </Grid>
  );
}
