'use client';

import useBlockDetail from '@/hooks/useBlockDetail';
import { getNewPathByRollapp } from '@/utils/common';
import Link from '@mui/material/Link';
import { Block } from '@/consts/rpcResTypes';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { Path } from '@/consts/path';
import { formatUnixTime } from '@/utils/datetime';
import { DetailItem } from '@/components/commons/DetailItem';
import Grid from '@mui/material/Grid';
import { Typography } from '@mui/material';

function getTxsDisplay(blockDetail: Block | null, pathname: string) {
  const txCount = blockDetail ? blockDetail.txs.length : 0;
  return txCount ? (
    <Link
      href={`${getNewPathByRollapp(pathname, Path.TRANSACTIONS)}?block=${
        blockDetail!.height
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
  const router = useRouter();

  if (!blockDetail && !loading)
    return void router.push(getNewPathByRollapp(pathname, Path.NOT_FOUND));

  const txsDisplay = getTxsDisplay(blockDetail, pathname);
  return (
    <Grid container spacing={1}>
      <DetailItem label="Block height" value={blockNo} loading={loading} />
      <DetailItem
        label="Date Time"
        value={blockDetail && formatUnixTime(blockDetail.timeEpochUTC)}
        loading={loading}
      />
      <DetailItem
        label="Transactions"
        value={<Typography>{txsDisplay} in this block</Typography>}
        loading={loading}
      />
    </Grid>
  );
}
