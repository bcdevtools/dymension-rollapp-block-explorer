'use client';

import Label from '@/components/detail/Label';
import Value from '@/components/detail/Value';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import useBlockDetail from '@/hooks/useBlockDetail';
import { formatUnixTime, getNewPathByRollapp } from '@/utils/common';
import Link from '@mui/material/Link';
import { Block } from '@/consts/rpcResTypes';
import { useParams, usePathname } from 'next/navigation';
import { Path } from '@/consts/path';

function getTxsDisplay(blockDetail: Block, pathname: string) {
  return blockDetail.txs.length ? (
    <Link
      href={`${getNewPathByRollapp(pathname, Path.TRANSACTIONS)}?block=${
        blockDetail.height
      }`}
      underline="hover">
      {blockDetail.txs.length} transacion{blockDetail.txs.length > 1 && 's'}
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
    <>
      <Grid container spacing={1}>
        <Label text="Block height" />
        <Value>
          <Typography>{blockNo}</Typography>
        </Value>
        <Label text="Date Time" />
        <Value>
          <Typography>{formatUnixTime(blockDetail.timeEpochUTC)}</Typography>
        </Value>
        <Label text="Transactions" />
        <Value>
          <Typography>{txsDisplay} in this block</Typography>
        </Value>
      </Grid>
    </>
  );
}
