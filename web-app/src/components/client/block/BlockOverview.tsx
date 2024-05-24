'use client';

import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { getTimeDurationDisplay } from '@/utils/datetime';
import dayjs from 'dayjs';
import Skeleton from '@mui/material/Skeleton';
import LinkToBlockNo from './LinkToBlockNo';
import { useRecentBlocks } from '@/hooks/useRecentBlocks';
import get from 'lodash/get';
import { useEffect, useState } from 'react';
import ShortAddress from '@/components/commons/ShortAddress';

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
  const [timeDisplay, setTimeDisplay] = useState<string[]>([]);
  const [recentBlocks, recentBlocksLoading] = useRecentBlocks(0, DEFAULT_BLOCK_OVERVIEW_SIZE, {
    useFallback: true,
    autoRefresh: true,
  });

  useEffect(() => {
    const getTimeDisplay = function () {
      if (recentBlocks) {
        const _timeDisplay = recentBlocks.blocks.map(recentBlock =>
          getTimeDurationDisplay(dayjs.unix(recentBlock.timeEpochUTC)),
        );
        setTimeDisplay(_timeDisplay);
      }
    };
    getTimeDisplay();
    const intervalId = setInterval(getTimeDisplay, 1000);
    return () => clearInterval(intervalId);
  }, [recentBlocks]);

  const loading = recentBlocksLoading && !get(recentBlocks, 'blocks', []).length;

  return (
    <Grid container spacing={2}>
      {loading
        ? getBlockLoading()
        : recentBlocks!.blocks.map((recentBlock, idx) => {
            const { height } = recentBlock;
            return (
              <Grid key={height} item xs={12} md={6} xl={3}>
                <StyledPaper elevation={4}>
                  <Typography variant="h6">
                    <LinkToBlockNo blockNo={height} />
                  </Typography>
                  <Box fontSize="0.85rem">
                    <Typography color="text.secondary" fontSize="inherit">
                      {recentBlock.txsCount} Transactions{' • '}
                      {timeDisplay[idx]}
                    </Typography>
                    <Typography color="text.secondary" display="inline" fontSize="inherit">
                      Proposer{' '}
                    </Typography>
                    <span>
                      {recentBlock.proposer
                        ? recentBlock.proposer.moniker || (
                            <ShortAddress address={recentBlock.proposer.consensusAddress} />
                          )
                        : '-'}
                    </span>
                  </Box>
                </StyledPaper>
              </Grid>
            );
          })}
    </Grid>
  );
}
