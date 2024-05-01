import { useRollappStore } from '@/stores/rollappStore';
import { useContext, useEffect, useState } from 'react';
import { getResponseResult } from '@/services/rpc.service';
import ErrorContext from '@/contexts/ErrorContext';
import { useMountedState } from './useMountedState';

export function useLatestBlock(
  autoRefresh: boolean = false
): [number, boolean] {
  const [latestBlockNo, setLatestBlockNo] = useState(0);
  const [loading, setLoading] = useState(true);
  const [{ rpcService }] = useRollappStore(true);
  const { showErrorSnackbar } = useContext(ErrorContext);
  const mounted = useMountedState();

  useEffect(() => {
    let ac: AbortController | null;
    let intervalId: NodeJS.Timeout | null = null;
    if (!rpcService) throw new Error('Cannot find Rpc Service');

    const fetchLatestBlock = async function () {
      try {
        const result = rpcService.getLatestBlockNumber();

        ac = result[1];
        const latestBlockResult = await getResponseResult(result[0]);
        setLatestBlockNo(latestBlockResult.latestBlock);
        setLoading(false);

        return result[1];
      } catch (e) {
        console.log(e);
        if (mounted.current) showErrorSnackbar('Failed to lastest block');
      } finally {
        ac = null;
        if (mounted.current) setLoading(false);
      }
    };

    if (autoRefresh) intervalId = setInterval(() => fetchLatestBlock(), 1000);
    else fetchLatestBlock();

    return () => {
      if (ac) ac.abort('useLatestBlock cleanup');
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoRefresh, rpcService, showErrorSnackbar, mounted]);

  return [latestBlockNo, loading];
}
