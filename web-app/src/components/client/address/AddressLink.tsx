'use client';

import Link from '../../commons/Link';
import CopyButton from '../commons/CopyButton';
import { Path } from '@/consts/path';
import { getNewPathByRollapp } from '@/utils/common';
import { DYM_ADDRESS_PREFIX, DYM_ESCAN_URL } from '@/consts/address';
import { usePathname } from 'next/navigation';

type AddressLinkProps = Readonly<{
  address: string;
  display?: string;
  showCopyButton?: boolean;
}>;

export default function AddressLink({ address, display, showCopyButton = true }: AddressLinkProps) {
  const pathname = usePathname();
  return (
    <>
      <Link
        href={
          address.toLowerCase().startsWith(DYM_ADDRESS_PREFIX)
            ? `${DYM_ESCAN_URL}/address/${address}`
            : getNewPathByRollapp(pathname, `${Path.ADDRESS}/${address}`)
        }
        sx={{ fontStyle: 'normal' }}
        target='_blank'>
        {display || address}
      </Link>
      {showCopyButton && <CopyButton size="small" textToCopy={address} />}
    </>
  );
}
