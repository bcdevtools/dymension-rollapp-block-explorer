'use client';

import AddressSummary from '@/components/client/address/AddressSummary';
import { AddressPageTitle } from '@/components/client/address/AddressPageTitle';
import useAccount from '@/hooks/useAccount';
import useDenomsMetadata from '@/hooks/useDenomsMetadata';
import { useEffect, useMemo } from 'react';
import { BalancesWithMetadata } from '@/utils/address';
import AccountContext from '@/contexts/AccountContext';
import { Account } from '@/services/db/accounts';
import { notFound } from 'next/navigation';
import TokenSummary from './TokenSummary';

type AddressPageProps = Readonly<{
  bech32Address: string;
  evmAddress: string | null;
  accountInfo: Account | null;
  tokenMode: boolean;
}>;

export default function AddressPageTitleAndSummary({
  bech32Address,
  accountInfo,
  evmAddress,
  tokenMode,
}: AddressPageProps) {
  const [accountRpcData, accountLoading] = useAccount(bech32Address);
  const [denomsMetadata, denomsMetadataLoading] = useDenomsMetadata();

  const isToken = useMemo(
    () => accountRpcData && accountRpcData.contract && Object.keys(accountRpcData.contract).length,
    [accountRpcData],
  );

  useEffect(() => {
    if (tokenMode && accountRpcData && (!accountRpcData.contract || !Object.keys(accountRpcData.contract).length))
      notFound();
  }, [accountRpcData, tokenMode]);

  const balancesWithMetadata = useMemo(() => {
    return accountRpcData
      ? Object.keys(accountRpcData.balances).reduce<BalancesWithMetadata>((final, denom) => {
          final[denom] = {
            balance: accountRpcData.balances[denom],
            metadata: denomsMetadata[denom],
          };
          return final;
        }, {})
      : null;
  }, [denomsMetadata, accountRpcData]);

  return (
    <>
      <AddressPageTitle bech32Address={bech32Address} evmAddress={evmAddress} account={accountRpcData} />
      {isToken && <TokenSummary contract={accountRpcData!.contract!} loading={accountLoading} />}
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
