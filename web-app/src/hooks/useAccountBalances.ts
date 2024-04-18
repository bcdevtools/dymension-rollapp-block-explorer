import { AccountBalances } from '@/consts/rpcResTypes';
import { useRollappStore } from '@/stores/rollappStore';
import { useEffect, useState } from 'react';

export default function useAccountBalances(
  address: string
): [AccountBalances | null, boolean] {
  const [loading, setLoading] = useState(true);
  const [balances, setBalances] = useState<AccountBalances | null>(null);
  const [{ rpcService }] = useRollappStore();

  useEffect(() => {
    const ac = new AbortController();
    let ignore = false;
    if (rpcService && address) {
      (async function () {
        try {
          setLoading(true);
          const accountBalances = await rpcService.getAccountBalances(address);
          setBalances(accountBalances);
        } catch (e) {
          console.log(e);
        } finally {
          if (!ignore) setLoading(false);
        }
      })();
    } else setBalances(null);
    return () => {
      ac.abort();
      ignore = true;
    };
  }, [address, rpcService]);

  return [balances, loading];
}
