'use client';

import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { Skeleton } from '@mui/material';
import { useLatestBlock } from '@/hooks/useLatestBlock';
import BlockList from './_BlockListTable';

function BlockSummaryCard({
  label,
  loading = false,
  children,
}: Readonly<{ label: string; loading?: boolean; children: React.ReactNode }>) {
  return (
    <Grid item xs={6} md={3}>
      <Paper sx={{ p: 1 }} elevation={3}>
        <Grid container>
          <Grid item xs={12}>
            <Typography color="gray">{label}</Typography>
          </Grid>
          <Grid item xs={12}>
            {loading ? <Skeleton /> : children}
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  );
}

export default function BlockContent() {
  const [latestBlockNo, loading] = useLatestBlock();

  return (
    <>
      <Grid container spacing={2} sx={{ my: 2 }}>
        <BlockSummaryCard label="Block Height" loading={loading}>
          <Typography>{latestBlockNo}</Typography>
        </BlockSummaryCard>
        <BlockSummaryCard label="Block Count (Last 24H)" loading={loading}>
          <Typography>test</Typography>
        </BlockSummaryCard>
        <BlockSummaryCard label="Tx Count (Last 24H)" loading={loading}>
          <Typography>test</Typography>
        </BlockSummaryCard>
        <BlockSummaryCard label="Block Time" loading={loading}>
          <Typography>test</Typography>
        </BlockSummaryCard>
      </Grid>
      <BlockList latestBlockNo={latestBlockNo} />
    </>
  );
}
