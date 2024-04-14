'use client';

import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';

function SummaryCard({
  title,
  loading = false,
  children,
}: Readonly<{ title: string; loading?: boolean; children: React.ReactNode }>) {
  return (
    <Grid item xs={6}>
      <Paper sx={{ p: 1, height: 80 }} variant="outlined">
        <Box
          display="flex"
          flexDirection="column"
          height="100%"
          width="100%"
          justifyContent="space-between">
          <Typography variant="subtitle1" gutterBottom>
            <b>{title}</b>
          </Typography>
          {loading ? <Skeleton /> : children}
        </Box>
      </Paper>
    </Grid>
  );
}

export default function AddressSummary() {
  return (
    <>
      <Box marginBottom={3}>
        <SummaryCard title="Overview">Test</SummaryCard>
      </Box>
    </>
  );
}
