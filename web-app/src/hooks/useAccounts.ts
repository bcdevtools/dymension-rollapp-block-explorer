import { Account } from '@/consts/rpcResTypes';
import ErrorContext from '@/contexts/ErrorContext';
import { getResponseResult } from '@/services/rpc.service';
import { useRollappStore } from '@/stores/rollappStore';
import { useContext, useEffect, useState } from 'react';
import { useMountedState } from './useMountedState';

export default function useAccounts(address: string[]): [Account[], boolean] {
  const [loading, setLoading] = useState(true);
  const [accountData, setAccountData] = useState<Account[]>([]);
  const [{ rpcService }] = useRollappStore();
  const { showErrorSnackbar } = useContext(ErrorContext);
  const mounted = useMountedState();

  useEffect(() => {
    let ac: AbortController | null;
    if (!rpcService) throw new Error('Cannot find Rpc Service');

    if (address) {
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
          if (mounted.current) showErrorSnackbar('Failed to fetch Accounts');
        } finally {
          ac = null;
          if (mounted.current) setLoading(false);
        }
      })();
    } else setAccountData([]);

    return () => {
      if (ac) ac.abort();
    };
  }, [address, rpcService, showErrorSnackbar, mounted]);

  return [accountData, loading];
}
