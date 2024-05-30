'use client';

import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { GovProposal } from '@/consts/rpcResTypes';
import Chip from '@mui/material/Chip';
import { getNewPathByRollapp, getPrototypeFromTypeUrl } from '@/utils/common';
import CardActionArea from '@mui/material/CardActionArea';
import { formatUnixTime } from '@/utils/datetime';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import Big from 'big.js';
import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { styled } from '@mui/material/styles';
import ProposalStatusText from './ProposalStatusText';
import Link from 'next/link';
import { Path } from '@/consts/path';
import { usePathname } from 'next/navigation';
import get from 'lodash/get';

const StyledSpan = styled('span')(({ theme }) => ({
  color: theme.palette.text.primary,
}));

function getLinearGradientPercent(proposal: GovProposal): string[] {
  const { yes, no, noWithVeto, abstain } = proposal.finalTallyResult;

  const yesWithNo = new Big(yes).add(no);
  const yesWithNoWithNoWithVeto = yesWithNo.add(noWithVeto);
  const total = yesWithNoWithNoWithVeto.add(abstain);

  if (total.eq(0)) return ['0', '0', '0', '0', '0'];

  const a = new Big(yes).div(total).mul(100).toString();
  const b = a;
  const c = yesWithNo.div(total).mul(100).toString();
  const d = yesWithNoWithNoWithVeto.div(total).mul(100).toString();

  return [a, b, c, d];
}

function getProposalTitle(proposal: GovProposal) {
  const { protoContent } = proposal.messages[0];
  let title = '';
  if (!title && protoContent.plan) {
    title = get(protoContent, 'plan.name', '');
  }
  if (!title && protoContent.content) {
    title = get(protoContent, 'content.title', '');
  }
  return title;
}

export default React.memo(function ProposalItem({ proposal, idx }: Readonly<{ proposal: GovProposal; idx: number }>) {
  const pathname = usePathname();
  const vp = getLinearGradientPercent(proposal);

  return (
    <CardActionArea
      key={proposal.id}
      sx={{ mt: idx ? 1 : 0 }}
      component={Link}
      href={`${getNewPathByRollapp(pathname, Path.PROPOSAL)}/${proposal.id}`}
      prefetch={false}>
      <Paper sx={{ p: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={6} px={1}>
            <ProposalStatusText status={proposal.status} />
          </Grid>
          <Grid display="flex" item justifyContent="end" xs={6} px={1}>
            <Typography variant="subtitle2">
              {Array.from(new Set(proposal.messages.map(i => i.type))).map((type, idx) => (
                <Chip size="small" key={idx} label={getPrototypeFromTypeUrl(type)} color="default" variant="outlined" />
              ))}
            </Typography>
          </Grid>
          <Grid item xs={6} px={1} alignItems="end">
            <Typography fontSize="1.4rem">
              <b>{`#${proposal.id} ${getProposalTitle(proposal)}`}</b>
            </Typography>
          </Grid>
          <Grid display="flex" item justifyContent="end" alignItems="end" xs={6} px={1}>
            <Typography color="text.secondary" variant="subtitle2">
              Voting end on <StyledSpan>{formatUnixTime(proposal.votingEndTimeEpochUTC)}</StyledSpan>
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <LinearProgress
              variant="determinate"
              value={100}
              sx={{
                height: 6,
                borderRadius: 5,
                [`& .${linearProgressClasses.bar}`]: {
                  borderRadius: 5,
                  background: `-webkit-linear-gradient(left, #66bb6a ${vp[0]}%, #d32f2f ${vp[1]}% ${vp[2]}%, #ce93d8 ${vp[2]}% ${vp[3]}%, grey ${vp[3]}%)`,
                },
              }}
            />
          </Grid>
        </Grid>
      </Paper>
    </CardActionArea>
  );
});

function ProposalLoadingItem({ idx }: { idx: number }) {
  return (
    <Paper sx={{ p: 1, mt: idx ? 1 : 0 }}>
      <Grid container spacing={2}>
        <Grid item xs={6} px={1}>
          <Skeleton width="20%" />
        </Grid>
        <Grid display="flex" item justifyContent="end" xs={6} px={1}>
          <Skeleton width="30%" />
        </Grid>
        <Grid item xs={6} px={1} alignItems="end">
          <Skeleton width="65%" />
        </Grid>
        <Grid display="flex" item justifyContent="end" alignItems="end" xs={6} px={1}>
          <Skeleton width="40%" />
        </Grid>
        <Grid item xs={12}>
          <Skeleton />
        </Grid>
      </Grid>
    </Paper>
  );
}

export function getLoadingItems(count: number) {
  return Array.from(Array(count)).map((n, idx) => <ProposalLoadingItem key={idx} idx={idx} />);
}
