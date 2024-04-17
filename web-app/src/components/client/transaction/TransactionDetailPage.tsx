'use client';

import useTransactionDetail from '@/hooks/useTransactionDetail';
import Typography from '@mui/material/Typography';
import { useParams, usePathname, useRouter } from 'next/navigation';
import Chip from '@mui/material/Chip';
import LinkToBlockNo from '../block/LinkToBlockNo';
import ClearIcon from '@mui/icons-material/Clear';
import DoneIcon from '@mui/icons-material/Done';
import { formatNumberString, getNewPathByRollapp } from '@/utils/common';
import CopyButton from '../commons/CopyButton';
import round from 'lodash/round';
import { Path } from '@/consts/path';
import Card from '@/components/commons/Card';
import TransactionData from './TransactionData';
import Grid from '@mui/material/Grid';
import { DetailItem } from '@/components/commons/DetailItem';
import Divider from '@mui/material/Divider';

function getStatusDisplay(success: boolean) {
  return success ? (
    <Chip label="Success" color="success" size="small" icon={<DoneIcon />} />
  ) : (
    <Chip label="Fail" color="error" size="small" icon={<ClearIcon />} />
  );
}

export default function TransactionDetailPage() {
  const params = useParams<{ txHash: string }>();
  const router = useRouter();
  const pathname = usePathname();
  const [transactionDetail, loading] = useTransactionDetail(params.txHash);

  if (loading) return null;
  if (!transactionDetail) {
    if (!loading)
      return void router.push(getNewPathByRollapp(pathname, Path.NOT_FOUND));
    return null;
  }
  const { used, limit } = transactionDetail.result.gas;

  return (
    <>
      <Card sx={{ mb: 3 }}>
        <Grid container spacing={1}>
          <DetailItem
            label="Transaction Hash"
            value={
              <Typography sx={{ wordBreak: 'break-word' }}>
                {transactionDetail.hash}{' '}
                <CopyButton size="small" textToCopy={transactionDetail.hash} />
              </Typography>
            }
          />
          <DetailItem
            label="Status"
            value={getStatusDisplay(transactionDetail.result.success)}
          />
          <DetailItem
            label="Block"
            value={<LinkToBlockNo blockNo={transactionDetail.height} />}
          />
          <Grid item xs={12} sx={{ my: 2 }}>
            <Divider />
          </Grid>
          <DetailItem
            label="Gas Usage & Limit"
            value={
              <Typography>
                {formatNumberString(used)} | {formatNumberString(limit)} (
                {round((used / limit) * 100, 2)}%)
              </Typography>
            }
          />
        </Grid>
      </Card>
      <TransactionData transaction={transactionDetail} />
    </>
  );
}
