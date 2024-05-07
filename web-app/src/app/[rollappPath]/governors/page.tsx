import ValidatorList from '@/components/client/address/ValidatorList';
import Card from '@/components/commons/Card';
import PageTitle from '@/components/commons/PageTitle';

export default async function Validators() {
  return (
    <>
      <PageTitle title="Governors" />
      <Card>
        <ValidatorList />
      </Card>
    </>
  );
}
