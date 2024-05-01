import Typography from '@mui/material/Typography';
import Link from './Link';
import CopyButton from '../client/commons/CopyButton';
import { Path } from '@/consts/path';
import { getNewPathByRollapp } from '@/utils/common';

type AddressLinkProps = Readonly<{
  address: string;
  display?: string;
  pathname: string;
}>;

export default function AddressLink({
  address,
  display,
  pathname,
}: AddressLinkProps) {
  return (
    <Typography sx={{ fontStyle: 'italic' }}>
      {
        <>
          <Link
            href={getNewPathByRollapp(pathname, `${Path.ADDRESS}/${address}`)}
            sx={{ fontStyle: 'normal' }}>
            {display || address}
          </Link>
          <CopyButton size="small" textToCopy={address} />
        </>
      }
    </Typography>
  );
}
