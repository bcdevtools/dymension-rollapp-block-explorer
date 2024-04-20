import { useRollappStore } from '@/stores/rollappStore';
import { useCallback, useEffect, useState } from 'react';
import { useMountedState } from './useMountedState';

export function useLatestBlock(
  autoRefresh: boolean = false
): [number, boolean] {
  const [latestBlockNo, setLatestBlockNo] = useState(0);
  const [loading, setLoading] = useState(true);
  const [{ rpcService }] = useRollappStore(true);
  const mounted = useMountedState();

  const fetchBlocks = useCallback(
    async (ac: AbortController) => {
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
        if (mounted.current) setLoading(false);
      }
    },
    [rpcService, mounted]
  );

  useEffect(() => {
    const ac = new AbortController();

    let intervalId: NodeJS.Timeout | null = null;
    if (autoRefresh) intervalId = setInterval(() => fetchBlocks(ac), 1000);
    else fetchBlocks(ac);

    return () => {
      ac.abort();
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [fetchBlocks, autoRefresh]);

  return [latestBlockNo, loading];
}
