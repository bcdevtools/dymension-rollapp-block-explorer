'use client';

import Card from '@/components/commons/Card';
import { DetailItem } from '@/components/commons/DetailItem';
import PageTitle from '@/components/commons/PageTitle';
import useGovProposal from '@/hooks/useGovProposal';
import Grid from '@mui/material/Grid';
import { useParams } from 'next/navigation';
import Chip from '@mui/material/Chip';
import { GovProposal } from '@/consts/rpcResTypes';
import Big from 'big.js';
import { formatBlockchainAmount, formatNumber } from '@/utils/number';
import ProposalStatusText from './ProposalStatusText';
import { formatUnixTime } from '@/utils/datetime';
import TextField from '@mui/material/TextField';
import useDenomsMetadata from '@/hooks/useDenomsMetadata';
import { useMemo } from 'react';
import Typography from '@mui/material/Typography';

function getVotingPercent(proposal: GovProposal | null): {
  result: string[];
  maxId?: number;
} {
  const defaultResult = { result: ['0', '0', '0', '0'], maxId: -1 };
  if (!proposal) return defaultResult;
  let { yes, no, noWithVeto, abstain } = proposal.finalTallyResult;

  const total = new Big(yes).add(no).add(noWithVeto).add(abstain);
  if (total.eq(0)) return defaultResult;

  const yesBig = new Big(yes);
  const noBig = new Big(no);
  const noWithVetoBig = new Big(noWithVeto);
  const abstainBig = new Big(abstain);

  const a = yesBig.div(total).mul(100).round(2);
  const b = noBig.div(total).mul(100).round(2);
  const c = noWithVetoBig.div(total).mul(100).round(2);
  const d = total.sub(a).sub(b).sub(c).round(2);

  let max = 0;
  const dataInArray = [yesBig, noBig, noWithVetoBig, abstainBig];
  for (let i = 1; i < 4; i++) {
    if (dataInArray[i].gt(dataInArray[max])) max = i;
  }

  return {
    result: [
      formatNumber(a),
      formatNumber(b),
      formatNumber(c),
      formatNumber(d),
    ],
    maxId: max,
  };
}

function getVotingResult(proposal: GovProposal | null): React.ReactNode {
  if (!proposal) return '';
  const { result: votingPercents, maxId } = getVotingPercent(proposal);
  return (
    <>
      <Chip
        sx={{ mr: 1 }}
        label={
          <>
            Yes <strong>{votingPercents[0]}%</strong>
          </>
        }
        color="success"
        variant={maxId === 0 ? 'filled' : 'outlined'}
      />
      <Chip
        sx={{ mr: 1 }}
        label={
          <>
            No <strong>{votingPercents[1]}%</strong>
          </>
        }
        color="error"
        variant={maxId === 1 ? 'filled' : 'outlined'}
      />
      <Chip
        sx={{ mr: 1 }}
        label={
          <>
            No with veto <strong>{votingPercents[2]}%</strong>
          </>
        }
        color="warning"
        variant={maxId === 2 ? 'filled' : 'outlined'}
      />
      <Chip
        label={
          <>
            Abstain <strong>{votingPercents[3]}%</strong>
          </>
        }
        color="info"
        variant={maxId === 3 ? 'filled' : 'outlined'}
      />
    </>
  );
}

export default function GovernanceDetail() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id);
  const [proposal, loading] = useGovProposal(id);
  const [denomsMetadata, denomsMetadataloading] = useDenomsMetadata();

  const proposalTitle = proposal
    ? proposal.messages[0].protoContent.plan.name
    : '';

  const depositBalances = useMemo(() => {
    if (!proposal) return [];
    return Object.keys(proposal.totalDeposit).map(denom => {
      const denomMetadata = denomsMetadata[denom];
      if (!denomMetadata)
        return (
          <Typography key={denom}>
            {formatBlockchainAmount(proposal.totalDeposit[denom])}{' '}
            {denom.toUpperCase()}
          </Typography>
        );
      return (
        <Typography key={denom}>
          {formatBlockchainAmount(
            proposal.totalDeposit[denom],
            denomMetadata.highestExponent
          )}{' '}
          {denomMetadata.symbol}
        </Typography>
      );
    });
  }, [denomsMetadata, proposal]);

  return (
    <>
      <PageTitle title={`#${id}${proposalTitle && '. ' + proposalTitle}`} />
      <Card>
        <Grid container spacing={1}>
          <DetailItem
            label="Status"
            value={
              proposal ? <ProposalStatusText status={proposal.status} /> : '-'
            }
            loading={loading}
          />
          <DetailItem
            label="Voting Result"
            value={getVotingResult(proposal)}
            loading={loading}
          />
          <DetailItem
            label="Deposit End Time"
            value={proposal && formatUnixTime(proposal.depositEndTimeEpochUTC)}
            loading={loading}
          />
          <DetailItem
            label="Total Deposit"
            value={depositBalances}
            loading={loading}
          />
          <DetailItem
            label="Voting Start Time"
            value={proposal && formatUnixTime(proposal.votingStartTimeEpochUTC)}
            loading={loading}
          />
          <DetailItem
            label="Voting End Time"
            value={proposal && formatUnixTime(proposal.votingEndTimeEpochUTC)}
            loading={loading}
          />
          <DetailItem
            label="Metadata"
            value={proposal && proposal.metadata}
            loading={loading}
          />
          <DetailItem
            label="Message"
            value={
              <TextField
                value={proposal && JSON.stringify(proposal.messages, null, 4)}
                multiline
                // disabled
                sx={{ width: '100%', fontStyle: 'italic' }}
                size="small"
                maxRows={12}
              />
            }
            loading={loading}
          />
        </Grid>
      </Card>
    </>
  );
}
