'use client';

import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import { useLatestBlock } from '@/hooks/useLatestBlock';
import BlockListTable from './_BlockListTable';
import Box from '@mui/material/Box';
import Card from '@/components/commons/Card';

function BlockSummaryCard({
  label,
  loading = false,
  children,
}: Readonly<{ label: string; loading?: boolean; children: React.ReactNode }>) {
  return (
    <Grid item xs={6} lg={3}>
      <Paper sx={{ p: 1, height: 80 }} variant="outlined">
        <Box
          display="flex"
          flexDirection="column"
          height="100%"
          width="100%"
          justifyContent="space-between">
          <Typography variant="subtitle2" color="grey" gutterBottom>
            {label}
          </Typography>
          {loading ? <Skeleton /> : children}
        </Box>
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
          <Typography variant="h6">{latestBlockNo}</Typography>
        </BlockSummaryCard>
        <BlockSummaryCard label="Block Count (Last 24H)" loading={loading}>
          <Typography variant="h6">test</Typography>
        </BlockSummaryCard>
        <BlockSummaryCard label="Tx Count (Last 24H)" loading={loading}>
          <Typography variant="h6">test</Typography>
        </BlockSummaryCard>
        <BlockSummaryCard label="Block Time" loading={loading}>
          <Typography variant="h6">test</Typography>
        </BlockSummaryCard>
      </Grid>
      <Card>
        <BlockListTable
          latestBlockNo={latestBlockNo}
          loadingBlockNo={loading}
        />
      </Card>
    </>
  );
}
