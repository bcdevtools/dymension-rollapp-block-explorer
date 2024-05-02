import { Account } from '@/consts/rpcResTypes';
import { getResponseResult } from '@/services/rpc.service';
import { useRollappStore } from '@/stores/rollappStore';
import { useEffect, useState } from 'react';
import { useThrowError } from './useThrowError';
import { isAbortException } from '@/utils/common';

export default function useAccount(address: string): [Account | null, boolean] {
  const [loading, setLoading] = useState(true);
  const [accountData, setAccountData] = useState<Account | null>(null);
  const [{ rpcService }] = useRollappStore();
  const throwError = useThrowError();

  useEffect(() => {
    let ac: AbortController | null;
    if (!rpcService) throw new Error('Rpc Service is not available');

    if (address) {
      (async function () {
        try {
          setLoading(true);
          const result = rpcService.getAccount(address);
          ac = result[1];
          const account = await getResponseResult(result[0]);
          setAccountData(account);
          setLoading(false);
        } catch (e: any) {
          if (!isAbortException(e)) {
            console.log(e);
            throwError(new Error('Failed to fetch Account'));
          }
        } finally {
          ac = null;
        }
      })();
    } else setAccountData(null);

    return () => {
      if (ac) ac.abort();
    };
  }, [address, rpcService, throwError]);

  return [accountData, loading];
}
