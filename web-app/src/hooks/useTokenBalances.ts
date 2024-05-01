import { Erc20Balance } from '@/consts/rpcResTypes';
import ErrorContext from '@/contexts/ErrorContext';
import { getResponseResult } from '@/services/rpc.service';
import { useRollappStore } from '@/stores/rollappStore';
import { useContext, useEffect, useState } from 'react';
import { useMountedState } from './useMountedState';

export default function useTokenBalances(
  address: string,
  tokenAddresses: string[]
): [Erc20Balance[], boolean] {
  const [loading, setLoading] = useState(true);
  const [tokenBalances, setTokenBalances] = useState<Erc20Balance[]>([]);
  const [{ rpcService }] = useRollappStore();
  const { showErrorSnackbar } = useContext(ErrorContext);
  const mounted = useMountedState();

  useEffect(() => {
    let ac: AbortController | null;
    if (!rpcService) throw new Error('Cannot find Rpc Service');

    if (address && tokenAddresses.length) {
      (async function () {
        try {
          setLoading(true);
          const isERC20 = address.startsWith('0x');
          if (isERC20) {
            const result = rpcService.getErc20Balance(address, tokenAddresses);
            ac = result[1];
            const balances = await getResponseResult(result[0]);
            setTokenBalances(balances.erc20Balances);
          } else {
            const result = rpcService.getCw20Balance(address, tokenAddresses);
            ac = result[1];
            const balances = await getResponseResult(result[0]);
            setTokenBalances(balances.cw20Balances);
          }
          setLoading(false);
        } catch (e) {
          console.log(e);
          if (mounted.current)
            showErrorSnackbar('Failed to fetch Token Balances');
        } finally {
          ac = null;
          if (mounted.current) setLoading(false);
        }
      })();
    } else setTokenBalances([]);

    return () => {
      if (ac) ac.abort();
    };
  }, [address, tokenAddresses, rpcService, showErrorSnackbar, mounted]);

  return [tokenBalances, loading];
}
