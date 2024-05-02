import { Erc20Balance } from '@/consts/rpcResTypes';
import { getResponseResult } from '@/services/rpc.service';
import { useRollappStore } from '@/stores/rollappStore';
import { useEffect, useState } from 'react';
import { useThrowError } from './useThrowError';
import { isAbortException } from '@/utils/common';

export default function useTokenBalances(
  address: string,
  tokenAddresses: string[]
): [Erc20Balance[], boolean] {
  const [loading, setLoading] = useState(true);
  const [tokenBalances, setTokenBalances] = useState<Erc20Balance[]>([]);
  const [{ rpcService }] = useRollappStore();
  const throwError = useThrowError();

  useEffect(() => {
    let ac: AbortController | null;
    if (!rpcService) throw new Error('Rpc Service is not available');

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
        } catch (e: any) {
          if (!isAbortException(e)) {
            console.log(e);
            throwError(new Error('Failed to fetch Token Balances'));
          }
        } finally {
          ac = null;
        }
      })();
    } else setTokenBalances([]);

    return () => {
      if (ac) ac.abort();
    };
  }, [address, tokenAddresses, rpcService, throwError]);

  return [tokenBalances, loading];
}
