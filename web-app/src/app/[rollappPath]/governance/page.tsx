import PageTitle from '@/components/commons/PageTitle';
import GovernanceList from '@/components/client/governance/GovernanceList';

export default async function Governance() {
  return (
    <>
      <PageTitle title="Governance" />
      <GovernanceList />
    </>
  );
}
