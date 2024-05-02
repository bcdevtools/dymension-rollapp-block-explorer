'use client';

import Link from '../../commons/Link';
import CopyButton from '../commons/CopyButton';
import { Path } from '@/consts/path';
import { getNewPathByRollapp } from '@/utils/common';
import { DYM_ADDRESS_PREFIX, DYM_ESCAN_ADDRESS_URL } from '@/consts/address';
import { usePathname } from 'next/navigation';

type AddressLinkProps = Readonly<{
  address: string;
  display?: string;
}>;

export default function AddressLink({ address, display }: AddressLinkProps) {
  const pathname = usePathname();
  return (
    <>
      <Link
        href={
          address.toLowerCase().startsWith(DYM_ADDRESS_PREFIX)
            ? `${DYM_ESCAN_ADDRESS_URL}/${address}`
            : getNewPathByRollapp(pathname, `${Path.ADDRESS}/${address}`)
        }
        sx={{ fontStyle: 'normal' }}>
        {display || address}
      </Link>
      <CopyButton size="small" textToCopy={address} />
    </>
  );
}
