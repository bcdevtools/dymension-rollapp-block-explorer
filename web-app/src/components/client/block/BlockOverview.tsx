'use client';

import { useBlockList } from '@/hooks/useBlockList';
import { useLatestBlock } from '@/hooks/useLatestBlock';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { getNewPathByRollapp } from '@/utils/common';
import { usePathname } from 'next/navigation';
import { Path } from '@/consts/path';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { getTimeDurationDisplay } from '@/utils/datetime';
import dayjs from 'dayjs';
import Skeleton from '@mui/material/Skeleton';

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
  const pathname = usePathname();
  const [latestBlockNo, latestBlockLoading] = useLatestBlock();
  const [blocks, blockListLoading] = useBlockList(
    latestBlockNo,
    0,
    DEFAULT_BLOCK_OVERVIEW_SIZE
  );

  const loading = (blockListLoading || latestBlockLoading) && !blocks.length;

  return (
    <Grid container spacing={2}>
      {loading
        ? getBlockLoading()
        : blocks.map(block => (
            <Grid key={block.height} item xs={12} md={6} xl={3}>
              <StyledPaper elevation={4}>
                <Typography variant="h6">
                  <Link
                    href={getNewPathByRollapp(
                      pathname,
                      `${Path.BLOCKS}/${block.height}`
                    )}
                    underline="hover">
                    <b>{block.height}</b>
                  </Link>
                </Typography>
                <Box>
                  {block.txs.length} Transactions{' • '}
                  {getTimeDurationDisplay(dayjs.unix(block.timeEpochUTC))}
                </Box>
              </StyledPaper>
            </Grid>
          ))}
    </Grid>
  );
}
