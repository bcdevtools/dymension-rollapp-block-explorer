import PageTitle from '@/components/commons/PageTitle';
import GovernanceList from '@/components/client/governance/GovernanceList';

export default async function Governances() {
  return (
    <>
      <PageTitle title="Governances" />
      <GovernanceList />
    </>
  );
}
