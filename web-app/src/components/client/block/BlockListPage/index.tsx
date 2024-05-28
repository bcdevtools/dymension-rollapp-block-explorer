'use client';

import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import BlockListTable from './_BlockListTable';
import Box from '@mui/material/Box';
import Card from '@/components/commons/Card';
import { getPageAndPageSizeFromStringParam } from '@/utils/common';
import { PAGE_PARAM_NAME, PAGE_SIZE_PARAM_NAME } from '@/consts/setting';
import { useSearchParams } from 'next/navigation';
import { useRecentBlocks } from '@/hooks/useRecentBlocks';

type BlockListPageProps = Readonly<{ txsIn24h: number }>;

function BlockSummaryCard({
  label,
  loading = false,
  children,
}: Readonly<{ label: string; loading?: boolean; children: React.ReactNode }>) {
  return (
    <Grid item xs={6} lg={3}>
      <Paper sx={{ p: 1, height: 80 }} variant="outlined">
        <Box display="flex" flexDirection="column" height="100%" width="100%" justifyContent="space-between">
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {label}
          </Typography>
          {loading ? <Skeleton /> : children}
        </Box>
      </Paper>
    </Grid>
  );
}

export default function BlockListPage({ txsIn24h }: BlockListPageProps) {
  const searchParams = useSearchParams();
  const [pageSize, page] = getPageAndPageSizeFromStringParam(
    searchParams.get(PAGE_SIZE_PARAM_NAME),
    searchParams.get(PAGE_PARAM_NAME),
  );
  const [recentBlocks, loading] = useRecentBlocks(page, pageSize, {
    useFallback: true,
  });

  return (
    <>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <BlockSummaryCard label="Block Height" loading={loading}>
          <Typography variant="h6">
            <strong>{recentBlocks?.latestBlock}</strong>
          </Typography>
        </BlockSummaryCard>
        <BlockSummaryCard label="Block Count (Last 24H)" loading={loading}>
          <Typography variant="h6">
            <strong>-</strong>
          </Typography>
        </BlockSummaryCard>
        <BlockSummaryCard label="Tx Count (Last 24H)" loading={loading}>
          <Typography variant="h6">
            <strong>{txsIn24h}</strong>
          </Typography>
        </BlockSummaryCard>
        <BlockSummaryCard label="Block Time" loading={loading}>
          <Typography variant="h6">
            <strong>-</strong>
          </Typography>
        </BlockSummaryCard>
      </Grid>
      <Card>
        <BlockListTable recentBlocks={recentBlocks} recentBlocksLoading={loading} page={page} pageSize={pageSize} />
      </Card>
    </>
  );
}
