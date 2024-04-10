'use client';

import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import { useLatestBlock } from '@/hooks/useLatestBlock';
import BlockListTable from './_BlockListTable';

function BlockSummaryCard({
  label,
  loading = false,
  children,
}: Readonly<{ label: string; loading?: boolean; children: React.ReactNode }>) {
  return (
    <Grid item xs={6} lg={3}>
      <Paper sx={{ p: 1, height: 80 }} square>
        <Grid container>
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              {label}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            {loading ? <Skeleton /> : children}
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  );
}

export default function BlockListPage() {
  const [latestBlockNo, loading] = useLatestBlock();

  return (
    <>
      <Grid container spacing={2} sx={{ mb: 3, mt: 1 }}>
        <BlockSummaryCard label="Block Height" loading={loading}>
          <Typography variant="h5">{latestBlockNo}</Typography>
        </BlockSummaryCard>
        <BlockSummaryCard label="Block Count (Last 24H)" loading={loading}>
          <Typography variant="h5">test</Typography>
        </BlockSummaryCard>
        <BlockSummaryCard label="Tx Count (Last 24H)" loading={loading}>
          <Typography variant="h5">test</Typography>
        </BlockSummaryCard>
        <BlockSummaryCard label="Block Time" loading={loading}>
          <Typography variant="h5">test</Typography>
        </BlockSummaryCard>
      </Grid>
      <BlockListTable latestBlockNo={latestBlockNo} loadingBlockNo={loading} />
    </>
  );
}
