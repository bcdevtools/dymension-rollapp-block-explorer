import { PROPOSAL_STATUS_DISPLAY, ProposalStatus } from '@/consts/proposal';
import { getProposalStatusColor } from '@/utils/governance';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

export default function ProposalStatusText({
  status,
}: Readonly<{ status: string }>) {
  const statusColor = getProposalStatusColor(status);
  return (
    <Typography variant="subtitle2" color={statusColor}>
      {status === ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD && (
        <>
          <CircularProgress size="0.875rem" color="info" disableShrink />{' '}
        </>
      )}
      {PROPOSAL_STATUS_DISPLAY[
        status as keyof typeof PROPOSAL_STATUS_DISPLAY
      ].toUpperCase()}
    </Typography>
  );
}
