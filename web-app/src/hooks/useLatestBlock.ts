import { useRollappStore } from '@/stores/rollappStore';
import { useCallback, useEffect, useState } from 'react';

export function useLatestBlock(
  autoRefresh: boolean = false
): [number, boolean] {
  const [latestBlockNo, setLatestBlockNo] = useState(0);
  const [loading, setLoading] = useState(true);
  const [{ rpcService }] = useRollappStore(true);

  const fetchBlocks = useCallback(
    async (ac: AbortController, ignore: boolean) => {
      if (!rpcService) {
        setLatestBlockNo(0);
        return;
      }

      try {
        const chainInfo = await rpcService.getLatestBlockNumber({
          signal: ac.signal,
        });
        setLatestBlockNo(chainInfo.latestBlock);
      } catch (e) {
        console.log(e);
      } finally {
        if (!ignore) setLoading(false);
      }
    },
    [rpcService]
  );

  useEffect(() => {
    const ac = new AbortController();
    let ignore = false;

    let intervalId: NodeJS.Timeout | null = null;
    if (autoRefresh)
      intervalId = setInterval(() => fetchBlocks(ac, ignore), 1000);
    else fetchBlocks(ac, ignore);

    return () => {
      ac.abort();
      if (intervalId) {
        clearInterval(intervalId);
      }
      ignore = true;
    };
  }, [fetchBlocks, autoRefresh]);

  return [latestBlockNo, loading];
}
