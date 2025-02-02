import BlockOverview from '@/components/client/block/BlockOverview';
import Card from '@/components/commons/Card';
import PageTitle from '@/components/commons/PageTitle';
import { getRollAppInfoByRollappPath } from '@/services/chain.service';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { Path } from '@/consts/path';
import TransactionListTable from '@/components/client/transaction/TransactionListTable';
import { getTransactions } from '@/services/db/transactions';

type RollappOverviewProps = Readonly<{
  params: { rollappPath: string };
}>;

const DEFAULT_TX_OVERVIEW_SIZE = 10;

export default async function Overview({ params }: RollappOverviewProps) {
  const rollappInfo = (await getRollAppInfoByRollappPath(params.rollappPath))!;

  if (!rollappInfo) {
    console.log('Trying to access invalid rollapp path', params.rollappPath);
    return null;
  }
  const transactions = await getTransactions(rollappInfo.chain_id, {
    take: DEFAULT_TX_OVERVIEW_SIZE,
  });

  return (
    <>
      <PageTitle title={rollappInfo.name.toUpperCase()} subtitle={rollappInfo.chain_id} />

      <Card sx={{ mb: 2, width: '100%' }}>
        <Box display="flex" justifyContent="space-between" mb={3}>
          <Typography variant="h6">Blocks</Typography>
          <Button variant="outlined" component={Link} href={`${rollappInfo.path}${Path.BLOCKS}`} size="small">
            View All Blocks
          </Button>
        </Box>

        <BlockOverview />
      </Card>
      <Card sx={{ width: '100%' }}>
        <Box display="flex" justifyContent="space-between" mb={3}>
          <Typography variant="h6">Transactions</Typography>
          <Button variant="outlined" component={Link} href={`${rollappInfo.path}${Path.TRANSACTIONS}`} size="small">
            View All Transactions
          </Button>
        </Box>
        <TransactionListTable transactions={transactions} includeValue enablePagination={false} autoRefresh />
      </Card>
    </>
  );
}
