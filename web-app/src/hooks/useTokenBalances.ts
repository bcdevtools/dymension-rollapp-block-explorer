import { Erc20Balance } from '@/consts/rpcResTypes';
import { getResponseResult } from '@/services/rpc.service';
import { useRollappStore } from '@/stores/rollappStore';
import { useEffect, useState } from 'react';

export default function useTokenBalances(
  address: string,
  tokenAddresses: string[]
): [Erc20Balance[], boolean] {
  const [loading, setLoading] = useState(true);
  const [tokenBalances, setTokenBalances] = useState<Erc20Balance[]>([]);
  const [{ rpcService }] = useRollappStore();

  useEffect(() => {
    let ac: AbortController | null;
    if (rpcService && address && tokenAddresses.length) {
      (async function () {
        try {
          setLoading(true);
          const result = rpcService.getErc20Balance(address, tokenAddresses);
          ac = result[1];
          const balances = await getResponseResult(result[0]);
          setTokenBalances(balances.erc20Balances);
          setLoading(false);
        } catch (e) {
          console.log(e);
        } finally {
          ac = null;
        }
      })();
    } else setTokenBalances([]);
    return () => {
      if (ac) ac.abort();
    };
  }, [address, tokenAddresses, rpcService]);

  return [tokenBalances, loading];
}
