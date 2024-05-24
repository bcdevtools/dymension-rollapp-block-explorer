'use client';

import { PAGE_PARAM_NAME } from '@/consts/setting';
import useGovProposals from '@/hooks/useGovProposals';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { GovProposal } from '@/consts/rpcResTypes';
import { ProposalStatus } from '@/consts/proposal';
import Card from '@/components/commons/Card';
import TablePagination from '@mui/material/TablePagination';
import ProposalItem, { getLoadingItems } from './GovernanceItem';

const PAGE_SIZE = 20;

export default function GovernanceList() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = useMemo(() => {
    const pageInt = parseInt(searchParams.get(PAGE_PARAM_NAME) || '0');
    return isNaN(pageInt) ? 0 : pageInt;
  }, [searchParams]);

  const [govProposals, loading] = useGovProposals(page + 1);

  const [liveProposals, allProposals] = useMemo(
    () =>
      govProposals
        ? Object.values(govProposals.proposals)
            .sort((a, b) => b.id - a.id)
            .reduce<[GovProposal[], GovProposal[]]>(
              ([r1, r2], proposal) =>
                proposal.status === ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD
                  ? [[...r1, proposal], r2]
                  : [r1, [...r2, proposal]],
              [[], []],
            )
        : [[], []],
    [govProposals],
  );

  return (
    <>
      <Card>
        <Typography variant="h6" gutterBottom>
          Live Proposal
        </Typography>
        {loading ? (
          getLoadingItems(3)
        ) : liveProposals.length ? (
          liveProposals.map((proposal, idx) => <ProposalItem key={proposal.id} proposal={proposal} idx={idx} />)
        ) : (
          <Box display="flex" justifyContent="center">
            <Typography color="text.secondary">There is currently no live proposal</Typography>
          </Box>
        )}
      </Card>
      <Card sx={{ mt: 1 }}>
        <Typography variant="h6" gutterBottom>
          Proposals
        </Typography>
        {loading ? (
          getLoadingItems(PAGE_SIZE)
        ) : allProposals.length ? (
          allProposals.map((proposal, idx) => <ProposalItem key={proposal.id} proposal={proposal} idx={idx} />)
        ) : (
          <Box display="flex" justifyContent="center">
            <Typography color="text.secondary">No data</Typography>
          </Box>
        )}
        <TablePagination
          component="div"
          rowsPerPageOptions={[]}
          count={-1}
          rowsPerPage={PAGE_SIZE}
          page={page}
          onPageChange={(e, newPage: number) => {
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.set(PAGE_PARAM_NAME, newPage.toString());
            router.push(`${pathname}?${newSearchParams.toString()}`, {
              scroll: false,
            });
          }}
          showFirstButton={false}
          showLastButton={false}
          labelDisplayedRows={() => null}
          slotProps={{
            actions: {
              nextButton: {
                disabled: !allProposals.length || allProposals[allProposals.length - 1].id === 1,
              },
            },
          }}
        />
      </Card>
    </>
  );
}
