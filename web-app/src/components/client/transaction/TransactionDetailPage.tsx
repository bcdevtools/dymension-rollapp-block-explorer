'use client';

import useTransactionDetail from '@/hooks/useTransactionDetail';
import Typography from '@mui/material/Typography';
import { useParams } from 'next/navigation';
import Chip from '@mui/material/Chip';
import LinkToBlockNo from '../block/LinkToBlockNo';
import ClearIcon from '@mui/icons-material/Clear';
import DoneIcon from '@mui/icons-material/Done';
import DataDetail from '@/components/commons/DataDetail';
import { formatNumberString } from '@/utils/common';
import CopyButton from '../commons/CopyButton';
import round from 'lodash/round';

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

  if (loading) return null;
  if (!transactionDetail) return null;
  const { used, limit } = transactionDetail.result.gas;

  return (
    <>
      <DataDetail
        data={[
          {
            label: 'Transaction Hash',
            value: (
              <Typography>
                {transactionDetail.hash}{' '}
                <CopyButton size="small" textToCopy={transactionDetail.hash} />
              </Typography>
            ),
          },
          {
            label: 'Status',
            value: getStatusDisplay(transactionDetail.result.success),
          },
          {
            label: 'Block',
            value: <LinkToBlockNo blockNo={transactionDetail.height} />,
          },
          null, //divider
          {
            label: 'Gas Limit & Usage',
            value: (
              <Typography>
                {formatNumberString(limit)} | {formatNumberString(used)} (
                {round((used / limit) * 100, 2)}%)
              </Typography>
            ),
          },
        ]}
      />
    </>
  );
}
