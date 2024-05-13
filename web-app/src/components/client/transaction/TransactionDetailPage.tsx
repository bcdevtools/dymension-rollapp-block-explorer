'use client';

import useTransactionDetail from '@/hooks/useTransactionDetail';
import Typography from '@mui/material/Typography';
import { notFound, useParams } from 'next/navigation';
import Chip from '@mui/material/Chip';
import LinkToBlockNo from '../block/LinkToBlockNo';
import ClearIcon from '@mui/icons-material/Clear';
import DoneIcon from '@mui/icons-material/Done';
import { formatNumber } from '@/utils/number';
import CopyButton from '../commons/CopyButton';
import round from 'lodash/round';
import Card from '@/components/commons/Card';
import TransactionData from './TransactionData';
import Grid from '@mui/material/Grid';
import { DetailItem } from '@/components/commons/DetailItem';
import Divider from '@mui/material/Divider';
import get from 'lodash/get';

function getStatusDisplay(success: boolean) {
  return success ? (
    <Chip label="Success" color="success" size="small" icon={<DoneIcon />} />
  ) : (
    <Chip label="Fail" color="error" size="small" icon={<ClearIcon />} />
  );
}

export default function TransactionDetailPage() {
  const params = useParams<{ txHash: string }>();
  const [transactionDetail, loading] = useTransactionDetail(params.txHash);

  if (!transactionDetail && !loading) {
    return notFound();
  }

  const used: number = get(transactionDetail, 'result.gas.used', 0);
  const limit: number = get(transactionDetail, 'result.gas.limit', 0);

  return (
    <>
      <Card sx={{ mb: 3 }}>
        <Grid container spacing={1}>
          <DetailItem
            label="Transaction Hash"
            value={
              transactionDetail && (
                <>
                  <Typography sx={{ wordBreak: 'break-word' }}>
                    {transactionDetail.hash}{' '}
                    <CopyButton
                      size="small"
                      textToCopy={transactionDetail.hash}
                    />
                  </Typography>
                  {params.txHash !== transactionDetail.hash && (
                    <Typography sx={{ wordBreak: 'break-word' }}>
                      {params.txHash}{' '}
                      <CopyButton size="small" textToCopy={params.txHash} />
                    </Typography>
                  )}
                </>
              )
            }
            loading={loading}
          />
          <DetailItem
            label="Status"
            value={
              transactionDetail &&
              getStatusDisplay(transactionDetail.result.success)
            }
            loading={loading}
          />
          <DetailItem
            label="Block"
            value={
              transactionDetail && (
                <LinkToBlockNo blockNo={transactionDetail.height} />
              )
            }
            loading={loading}
          />
          <Grid item xs={12} sx={{ my: 2 }}>
            <Divider />
          </Grid>
          <DetailItem
            label="Gas Usage & Limit"
            value={
              transactionDetail && (
                <Typography>
                  {formatNumber(used)} | {formatNumber(limit)} (
                  {round((used / limit) * 100, 2)}%)
                </Typography>
              )
            }
            loading={loading}
          />
        </Grid>
      </Card>
      <TransactionData transaction={transactionDetail} />
    </>
  );
}
