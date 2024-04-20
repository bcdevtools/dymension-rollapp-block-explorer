import { Transaction } from '@/consts/rpcResTypes';
import { useRollappStore } from '@/stores/rollappStore';
import { useEffect, useState } from 'react';
import { useMountedState } from './useMountedState';

export default function useTransactionDetail(
  txHash: string
): [Transaction | null, boolean] {
  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [{ rpcService }] = useRollappStore();

  useEffect(() => {
    const ac = new AbortController();
    if (rpcService && txHash) {
      (async function () {
        try {
          setLoading(true);
          const _transaction = await rpcService.getTransactionByHash(txHash);
          setTransaction(_transaction);
          setLoading(false);
        } catch (e) {
          console.log(e);
        }
      })();
    } else setTransaction(null);
    return () => {
      ac.abort();
    };
  }, [txHash, rpcService]);

  return [transaction, loading];
}
