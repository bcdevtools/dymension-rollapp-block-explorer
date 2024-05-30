import { GovProposal } from '@/consts/rpcResTypes';
import get from 'lodash/get';

export function getProposalTitle(proposal: GovProposal | null) {
  let title = '';
  if (!proposal) return title;

  const { protoContent } = proposal.messages[0];

  if (!title && protoContent.plan) {
    title = get(protoContent, 'plan.name', '');
  }
  if (!title && protoContent.content) {
    title = get(protoContent, 'content.title', '');
  }
  return title;
}
