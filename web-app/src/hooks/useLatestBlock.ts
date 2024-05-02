import { useRollappStore } from '@/stores/rollappStore';
import { useEffect, useState } from 'react';
import { getResponseResult } from '@/services/rpc.service';
import { useThrowError } from './useThrowError';
import { isAbortException } from '@/utils/common';

export function useLatestBlock(
  autoRefresh: boolean = false
): [number, boolean] {
  const [latestBlockNo, setLatestBlockNo] = useState(0);
  const [loading, setLoading] = useState(true);
  const [{ rpcService }] = useRollappStore(true);
  const throwError = useThrowError();

  useEffect(() => {
    let ac: AbortController | null;
    let intervalId: NodeJS.Timeout | null = null;
    if (!rpcService) throw new Error('Rpc Service is not available');

    const fetchLatestBlock = async function () {
      try {
        const result = rpcService.getLatestBlockNumber();

        ac = result[1];
        const latestBlockResult = await getResponseResult(result[0]);
        setLatestBlockNo(latestBlockResult.latestBlock);
        setLoading(false);

        return result[1];
      } catch (e: any) {
        if (!isAbortException(e)) {
          console.log(e);
          throwError(new Error('Failed to fetch Lastest Block'));
        }
      } finally {
        ac = null;
      }
    };

    if (autoRefresh) intervalId = setInterval(() => fetchLatestBlock(), 1000);
    else fetchLatestBlock();

    return () => {
      if (ac) ac.abort();
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoRefresh, rpcService, throwError]);

  return [latestBlockNo, loading];
}
