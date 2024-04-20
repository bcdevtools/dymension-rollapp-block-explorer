import { useRollappStore } from '@/stores/rollappStore';
import { useEffect, useState } from 'react';
import { getResponseResult } from '@/services/rpc.service';

export function useLatestBlock(
  autoRefresh: boolean = false
): [number, boolean] {
  const [latestBlockNo, setLatestBlockNo] = useState(0);
  const [loading, setLoading] = useState(true);
  const [{ rpcService }] = useRollappStore(true);

  useEffect(() => {
    let ac: AbortController | null;

    async function fetchLatestBlock() {
      if (!rpcService) {
        setLatestBlockNo(0);
        return null;
      }
      const result = rpcService.getLatestBlockNumber();
      try {
        ac = result[1];
        const latestBlockResult = await getResponseResult(result[0]);
        setLatestBlockNo(latestBlockResult.latestBlock);
        setLoading(false);
      } catch (e) {
        console.log(e);
      } finally {
        ac = null;
      }

      return result[1];
    }

    let intervalId: NodeJS.Timeout | null = null;
    if (autoRefresh) intervalId = setInterval(() => fetchLatestBlock(), 1000);
    else fetchLatestBlock();

    return () => {
      if (ac) ac.abort('useLatestBlock cleanup');
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoRefresh, rpcService]);

  return [latestBlockNo, loading];
}
