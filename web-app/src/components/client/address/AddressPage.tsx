'use client';

import AddressSummary from '@/components/client/address/AddressSummary';
import { AddressPageTitle } from '@/components/client/address/AddressPageTitle';
import useAccount from '@/hooks/useAccount';
import useDenomsMetadata from '@/hooks/useDenomsMetadata';
import { useMemo } from 'react';
import { BalancesWithMetadata } from '@/utils/address';
import AccountContext from '@/contexts/AccountContext';

type AddressPageProps = Readonly<{
  bech32Address: string;
  evmAddress: string | null;
}>;

export default function AddressPageTitleAndSummary({
  bech32Address,
  evmAddress,
}: AddressPageProps) {
  const [accountData, accountLoading] = useAccount(bech32Address);
  const [denomsMetadata, denomsMetadataLoading] =
    useDenomsMetadata(bech32Address);

  const balancesWithMetadata = useMemo(() => {
    return accountData && denomsMetadata
      ? Object.keys(accountData.balances).reduce<BalancesWithMetadata>(
          (final, denom) => {
            final[denom] = {
              balance: accountData.balances[denom],
              metadata: denomsMetadata[denom],
            };
            return final;
          },
          {}
        )
      : null;
  }, [denomsMetadata, accountData]);

  return (
    <>
      <AddressPageTitle
        bech32Address={bech32Address}
        evmAddress={evmAddress}
        account={accountData}
      />
      <AccountContext.Provider
        value={{
          balancesWithMetadata,
          loading: accountLoading || denomsMetadataLoading,
        }}>
        <AddressSummary address={bech32Address} />
      </AccountContext.Provider>
    </>
  );
}
