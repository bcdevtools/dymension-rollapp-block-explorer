import PageTitle from '@/components/commons/PageTitle';
import BlockListPage from '@/components/client/block/BlockListPage';
import { getRollAppInfoByRollappPath } from '@/services/chain.service';
import { countTransactionsSinceTimestamp } from '@/services/db/transactions';
import dayjs from 'dayjs';

type BlocksProps = Readonly<{
  params: { rollappPath: string };
}>;

const ONE_DAY_IN_SECONDS = 24 * 60 * 60;

export default async function Blocks({ params }: BlocksProps) {
  const rollappInfo = (await getRollAppInfoByRollappPath(params.rollappPath))!;
  const txsIn24h = await countTransactionsSinceTimestamp(rollappInfo.chain_id, dayjs().unix() - ONE_DAY_IN_SECONDS);

  return (
    <>
      <PageTitle title="Blocks" />
      <BlockListPage txsIn24h={txsIn24h} />
    </>
  );
}
