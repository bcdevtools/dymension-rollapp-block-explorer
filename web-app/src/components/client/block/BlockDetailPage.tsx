'use client';

import useBlockDetail from '@/hooks/useBlockDetail';
import { getNewPathByRollapp } from '@/utils/common';
import { Block } from '@/consts/rpcResTypes';
import { notFound, useParams, usePathname } from 'next/navigation';
import { Path } from '@/consts/path';
import { formatUnixTime } from '@/utils/datetime';
import { DetailItem } from '@/components/commons/DetailItem';
import Grid from '@mui/material/Grid';
import Link from '@/components/commons/Link';
import DateWithTooltip from '@/components/commons/DateWithTooltip';

function getTxsDisplay(blockDetail: Block | null, pathname: string) {
  const txCount = blockDetail ? blockDetail.txs.length : 0;
  return txCount ? (
    <Link href={`${getNewPathByRollapp(pathname, Path.TRANSACTIONS)}?block=${blockDetail!.height}`}>
      {txCount} transaction{txCount > 1 && 's'}
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
  if (!blockDetail && !loading) return notFound();

  const txsDisplay = getTxsDisplay(blockDetail, pathname);
  return (
    <Grid container spacing={1}>
      <DetailItem label="Block height" value={blockNo} loading={loading} />
      <DetailItem
        label="Date Time"
        value={
          blockDetail && (
            <>
              <DateWithTooltip unixTimestamp={blockDetail.timeEpochUTC} /> ({formatUnixTime(blockDetail.timeEpochUTC)})
            </>
          )
        }
        loading={loading}
      />
      <DetailItem label="Transactions" value={<>{txsDisplay} in this block</>} loading={loading} />
    </Grid>
  );
}
