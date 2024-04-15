import { Transaction } from '@/consts/rpcResTypes';
import { useRollappStore } from '@/stores/rollappStore';
import { useEffect, useState } from 'react';

export default function useTransactionDetail(
  txHash: string
): [Transaction | null, boolean] {
  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [{ rpcService }] = useRollappStore();

  useEffect(() => {
    const ac = new AbortController();
    let ignore = false;
    if (rpcService && txHash) {
      (async function () {
        try {
          setLoading(true);
          const _transaction = await rpcService.getTransactionByHash(txHash);
          setTransaction(_transaction);
        } catch (e) {
          console.log(e);
        } finally {
          if (!ignore) setLoading(false);
        }
      })();
    } else setTransaction(null);
    return () => {
      ac.abort();
      ignore = true;
    };
  }, [txHash, rpcService]);

  return [transaction, loading];
}
