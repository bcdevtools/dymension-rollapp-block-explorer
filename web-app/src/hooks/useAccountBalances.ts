import { AccountBalances } from '@/consts/rpcResTypes';
import { getResponseResult } from '@/services/rpc.service';
import { useRollappStore } from '@/stores/rollappStore';
import { useEffect, useState } from 'react';

export default function useAccountBalances(
  address: string
): [AccountBalances | null, boolean] {
  const [loading, setLoading] = useState(true);
  const [balances, setBalances] = useState<AccountBalances | null>(null);
  const [{ rpcService }] = useRollappStore();

  useEffect(() => {
    let ac: AbortController | null;
    if (rpcService && address) {
      (async function () {
        try {
          setLoading(true);
          const result = rpcService.getAccountBalances(address);
          ac = result[1];
          const accountBalances = await getResponseResult(result[0]);
          setBalances(accountBalances);
          setLoading(false);
        } catch (e) {
          console.log(e);
        } finally {
          ac = null;
        }
      })();
    } else setBalances(null);
    return () => {
      if (ac) ac.abort();
    };
  }, [address, rpcService]);

  return [balances, loading];
}
