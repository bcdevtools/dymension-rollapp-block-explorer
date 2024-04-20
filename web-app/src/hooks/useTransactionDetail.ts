import { Transaction } from '@/consts/rpcResTypes';
import { getResponseResult } from '@/services/rpc.service';
import { useRollappStore } from '@/stores/rollappStore';
import { useEffect, useState } from 'react';

export default function useTransactionDetail(
  txHash: string
): [Transaction | null, boolean] {
  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [{ rpcService }] = useRollappStore();

  useEffect(() => {
    let ac: AbortController | null;
    if (rpcService && txHash) {
      (async function () {
        try {
          setLoading(true);
          const result = rpcService.getTransactionByHash(txHash);
          ac = result[1];

          const _transaction = await getResponseResult(result[0]);

          setTransaction(_transaction);
          setLoading(false);
        } catch (e) {
          console.log(e);
        } finally {
          ac = null;
        }
      })();
    } else setTransaction(null);
    return () => {
      if (ac) ac.abort('useTransactionDetail cleanup');
    };
  }, [txHash, rpcService]);

  return [transaction, loading];
}
