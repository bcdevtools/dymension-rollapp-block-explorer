'use client';

import Label from '@/components/detail/Label';
import Value from '@/components/detail/Value';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import useBlockDetail from '@/hooks/useBlockDetail';
import { formatUnixTime } from '@/utils/common';

type BlockDetailPageProps = Readonly<{ blockNo: number }>;

export default function BlockDetailPage({ blockNo }: BlockDetailPageProps) {
  const [blockDetail, loading] = useBlockDetail(blockNo);
  if (loading) return null;
  if (!blockDetail) return null;
  return (
    <>
      <Grid container sx={{ mt: 2 }}>
        <Label text="Block height" />
        <Value>
          <Typography>{blockNo}</Typography>
        </Value>
        <Label text="Date Time" />
        <Value>
          <Typography>{formatUnixTime(blockDetail.timeEpochUTC)}</Typography>
        </Value>
      </Grid>
    </>
  );
}
