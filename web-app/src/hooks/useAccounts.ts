import { Account } from '@/consts/rpcResTypes';
import { getResponseResult } from '@/services/rpc.service';
import { useRollappStore } from '@/stores/rollappStore';
import { useEffect, useState } from 'react';

export default function useAccounts(address: string[]): [Account[], boolean] {
  const [loading, setLoading] = useState(true);
  const [accountData, setAccountData] = useState<Account[]>([]);
  const [{ rpcService }] = useRollappStore();

  useEffect(() => {
    let ac: AbortController | null;
    if (rpcService && address) {
      (async function () {
        try {
          setLoading(true);
          const result = rpcService.getAccount(address);
          ac = result[1];
          const account = await getResponseResult(result[0]);
          setAccountData(account);
          setLoading(false);
        } catch (e) {
          console.log(e);
        } finally {
          ac = null;
        }
      })();
    } else setAccountData([]);
    return () => {
      if (ac) ac.abort();
    };
  }, [address, rpcService]);

  return [accountData, loading];
}
