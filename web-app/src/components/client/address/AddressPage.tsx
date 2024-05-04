'use client';

import AddressSummary from '@/components/client/address/AddressSummary';
import { AddressPageTitle } from '@/components/client/address/AddressPageTitle';
import useAccount from '@/hooks/useAccount';
import useDenomsMetadata from '@/hooks/useDenomsMetadata';
import { useMemo } from 'react';
import { BalancesWithMetadata } from '@/utils/address';
import AccountContext from '@/contexts/AccountContext';
import { Account } from '@/services/db/accounts';

type AddressPageProps = Readonly<{
  bech32Address: string;
  evmAddress: string | null;
  accountInfo: Account | null;
}>;

export default function AddressPageTitleAndSummary({
  bech32Address,
  accountInfo,
  evmAddress,
}: AddressPageProps) {
  const [accountRpcData, accountLoading] = useAccount(bech32Address);
  const [denomsMetadata, denomsMetadataLoading] =
    useDenomsMetadata(bech32Address);

  const balancesWithMetadata = useMemo(() => {
    return accountRpcData && denomsMetadata
      ? Object.keys(accountRpcData.balances).reduce<BalancesWithMetadata>(
          (final, denom) => {
            final[denom] = {
              balance: accountRpcData.balances[denom],
              metadata: denomsMetadata[denom],
            };
            return final;
          },
          {}
        )
      : null;
  }, [denomsMetadata, accountRpcData]);

  return (
    <>
      <AddressPageTitle
        bech32Address={bech32Address}
        evmAddress={evmAddress}
        account={accountRpcData}
      />
      <AccountContext.Provider
        value={{
          balancesWithMetadata,
          loading: accountLoading || denomsMetadataLoading,
        }}>
        <AddressSummary
          address={bech32Address}
          accountInfo={accountInfo}
          evmAddress={evmAddress}
          accountRpcData={accountRpcData}
        />
      </AccountContext.Provider>
    </>
  );
}
