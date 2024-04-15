'use client';

import Typography from '@mui/material/Typography';
import useBlockDetail from '@/hooks/useBlockDetail';
import { getNewPathByRollapp } from '@/utils/common';
import Link from '@mui/material/Link';
import { Block } from '@/consts/rpcResTypes';
import { useParams, usePathname } from 'next/navigation';
import { Path } from '@/consts/path';
import DataDetail from '@/components/commons/DataDetail';
import { formatUnixTime } from '@/utils/datetime';

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
    <DataDetail
      data={[
        { label: 'Block height', value: <Typography>{blockNo}</Typography> },
        {
          label: 'Date Time',
          value: (
            <Typography>{formatUnixTime(blockDetail.timeEpochUTC)}</Typography>
          ),
        },
        {
          label: 'Transactions',
          value: <Typography>{txsDisplay} in this block</Typography>,
        },
      ]}
    />
  );
}
