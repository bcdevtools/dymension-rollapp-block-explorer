import { getShortAddress } from '@/utils/address';
import Tooltip from '@mui/material/Tooltip';

export default function ShortAddress({ address }: Readonly<{ address: string }>) {
  return (
    <Tooltip title={address} arrow>
      <span>{getShortAddress(address)}</span>
    </Tooltip>
  );
}
