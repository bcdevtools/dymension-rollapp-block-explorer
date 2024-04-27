'use client';

import PageTitle from '@/components/commons/PageTitle';
import CopyButton from '../commons/CopyButton';
import useAccount from '@/hooks/useAccount';
import { useEffect, useState } from 'react';
import { getPrototypeFromTypeUrl } from '@/utils/address';
import CircularProgress from '@mui/material/CircularProgress';

type AddressPageTypeProps = Readonly<{
  bech32Address: string;
  evmAddress: string | null;
}>;

export function AddressPageTitle({
  bech32Address,
  evmAddress,
}: AddressPageTypeProps) {
  const [account] = useAccount(bech32Address);
  const [prototype, setPrototype] = useState<React.ReactNode>(
    <>
      Account <CircularProgress size={'1.5rem'} />
    </>
  );

  useEffect(() => {
    if (account) {
      if (account.contract) {
        setPrototype(`Smart Contract${account.contract.name ? `: ${account.contract.name}` : ''}${account.contract.symbol ? ` (${account.contract.symbol})` : ''}`);
      } else if (account.typeUrl) {
        setPrototype(getPrototypeFromTypeUrl(account.typeUrl));
      }
    }
  }, [account]);
  return (
    <PageTitle
      title={prototype}
      subtitle={
        <>
          <b>{bech32Address}</b>
          <CopyButton size="small" textToCopy={bech32Address} />
          {evmAddress && (
            <>
              <br />
              <b>{evmAddress}</b>
              <CopyButton size="small" textToCopy={evmAddress!} />
            </>
          )}
        </>
      }
    />
  );
}
