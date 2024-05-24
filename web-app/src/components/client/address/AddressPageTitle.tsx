'use client';

import PageTitle from '@/components/commons/PageTitle';
import CopyButton from '../commons/CopyButton';
import { useEffect, useState } from 'react';
import { getAccountType } from '@/utils/address';
import CircularProgress from '@mui/material/CircularProgress';
import { Account } from '@/consts/rpcResTypes';
import QRCodeButton from '../commons/QRCodeButton';

type AddressPageTypeProps = Readonly<{
  bech32Address: string;
  evmAddress: string | null;
  account?: Account | null;
  title?: string;
  isValidator?: boolean;
}>;

export function AddressPageTitle({
  bech32Address,
  evmAddress,
  account,
  isValidator = false,
  title,
}: AddressPageTypeProps) {
  const [prototype, setPrototype] = useState<React.ReactNode>(
    isValidator ? (
      'Governor'
    ) : (
      <>
        Account <CircularProgress size={'1.5rem'} />
      </>
    ),
  );

  useEffect(() => {
    if (account) {
      setPrototype(getAccountType(account));
    }
  }, [account]);

  return (
    <PageTitle
      title={title || prototype}
      subtitle={
        <>
          <b>{bech32Address}</b>
          <CopyButton size="small" textToCopy={bech32Address} />
          <QRCodeButton value={bech32Address} />
          {evmAddress && (
            <>
              <br />
              <b>{evmAddress}</b>
              <CopyButton size="small" textToCopy={evmAddress} />
              <QRCodeButton value={evmAddress} />
            </>
          )}
        </>
      }
    />
  );
}
