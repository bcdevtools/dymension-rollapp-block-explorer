import { ProposalStatus } from '@/consts/proposal';

export function getProposalStatusColor(status: string) {
  switch (status) {
    case ProposalStatus.PROPOSAL_STATUS_REJECTED:
      return 'error.main';
    case ProposalStatus.PROPOSAL_STATUS_PASSED:
      return 'success.main';
    case ProposalStatus.PROPOSAL_STATUS_FAILED:
      return 'grey';
    case ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD:
      return 'info.main';
    case ProposalStatus.PROPOSAL_STATUS_DEPOSIT_PERIOD:
      return 'warning.main';
    default:
      return 'text.primary';
  }
}
