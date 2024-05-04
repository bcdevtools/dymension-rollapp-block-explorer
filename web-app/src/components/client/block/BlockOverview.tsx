'use client';

import { isBlock, useBlockList } from '@/hooks/useBlockList';
import { useLatestBlock } from '@/hooks/useLatestBlock';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { getTimeDurationDisplay } from '@/utils/datetime';
import dayjs from 'dayjs';
import Skeleton from '@mui/material/Skeleton';
import LinkToBlockNo from './LinkToBlockNo';

const DEFAULT_BLOCK_OVERVIEW_SIZE = 4;

const StyledPaper = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
  height: 112,
}));

function getBlockLoading() {
  return Array.from(Array(DEFAULT_BLOCK_OVERVIEW_SIZE)).map((i, idx) => (
    <Grid key={idx} item xs={12} md={6} xl={3}>
      <StyledPaper elevation={4}>
        <Skeleton width="30%" />
        <Box>
          <Skeleton />
          <Skeleton />
        </Box>
      </StyledPaper>
    </Grid>
  ));
}

export default function BlockOverview() {
  const [latestBlockNo, latestBlockLoading] = useLatestBlock(false, false);
  const [blocks, blockListLoading] = useBlockList(
    latestBlockNo,
    0,
    DEFAULT_BLOCK_OVERVIEW_SIZE,
    false
  );

  const loading = (blockListLoading || latestBlockLoading) && !blocks.length;

  return (
    <Grid container spacing={2}>
      {loading
        ? getBlockLoading()
        : blocks.map((block, idx) => {
            const height = latestBlockNo - idx;
            return (
              <Grid key={height} item xs={12} md={6} xl={3}>
                <StyledPaper elevation={4}>
                  <Typography variant="h6">
                    <LinkToBlockNo blockNo={height} />
                  </Typography>
                  {isBlock(block) && (
                    <Typography color="text.secondary">
                      {block.txs.length} Transactions{' • '}
                      {getTimeDurationDisplay(dayjs.unix(block.timeEpochUTC))}
                    </Typography>
                  )}
                </StyledPaper>
              </Grid>
            );
          })}
    </Grid>
  );
}
