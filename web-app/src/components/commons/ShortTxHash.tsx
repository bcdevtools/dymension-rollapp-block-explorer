import { getShortTxHash } from '@/utils/transaction';
import Tooltip from '@mui/material/Tooltip';

export default function ShortTxHash({ txHash }: Readonly<{ txHash: string }>) {
  return (
    <Tooltip title={txHash} arrow>
      <span>{getShortTxHash(txHash)}</span>
    </Tooltip>
  );
}
