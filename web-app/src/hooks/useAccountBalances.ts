import { DenomMetadata } from '@/consts/rpcResTypes';
import ErrorContext from '@/contexts/ErrorContext';
import { getResponseResult } from '@/services/rpc.service';
import { useRollappStore } from '@/stores/rollappStore';
import { useContext, useEffect, useState } from 'react';
import { useMountedState } from './useMountedState';

export type BalanceWithMetadata = { balance: string; metadata?: DenomMetadata };

export type UseAccountBalancesResult = {
  [denom: string]: BalanceWithMetadata;
};

export default function useAccountBalances(
  address: string
): [UseAccountBalancesResult | null, boolean] {
  const [loading, setLoading] = useState(true);
  const [balances, setBalances] = useState<UseAccountBalancesResult | null>(
    null
  );
  const [{ rpcService }] = useRollappStore();
  const { showErrorSnackbar } = useContext(ErrorContext);
  const mounted = useMountedState();

  useEffect(() => {
    let acAccountBalances: AbortController | null;
    let acGetDenomMetaData: AbortController | null;
    if (!rpcService) throw new Error('Cannot find Rpc Service');

    if (address) {
      (async function () {
        try {
          setLoading(true);
          const accountBalancesResult = rpcService.getAccountBalances(address);
          acAccountBalances = accountBalancesResult[1];
          const denomsMetadataResult = rpcService.getDenomsMetadata();
          acGetDenomMetaData = denomsMetadataResult[1];

          const [accountBalances, denomsMetadata] = await Promise.all([
            getResponseResult(accountBalancesResult[0]),
            getResponseResult(denomsMetadataResult[0]),
          ]);

          const useAccountBalancesResult = Object.keys(
            accountBalances
          ).reduce<UseAccountBalancesResult>((final, denom) => {
            final[denom] = {
              balance: accountBalances[denom],
              metadata: denomsMetadata[denom],
            };
            return final;
          }, {});

          setBalances(useAccountBalancesResult);
          setLoading(false);
        } catch (e) {
          console.log(e);
          if (mounted.current) showErrorSnackbar('Failed to fetch balances');
        } finally {
          acAccountBalances = null;
          acGetDenomMetaData = null;
          if (mounted.current) setLoading(false);
        }
      })();
    } else setBalances(null);

    return () => {
      if (acAccountBalances) acAccountBalances.abort();
      if (acGetDenomMetaData) acGetDenomMetaData.abort();
    };
  }, [address, rpcService, showErrorSnackbar, mounted]);

  return [balances, loading];
}
