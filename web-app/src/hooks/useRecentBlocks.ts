import { RecentBlocks } from '@/consts/rpcResTypes';
import { getResponseResult } from '@/services/rpc.service';
import { useRollappStore } from '@/stores/rollappStore';
import { useEffect, useState } from 'react';
import { useThrowError } from './useThrowError';
import { isAbortException } from '@/utils/common';

export function useRecentBlocks(
  page: number,
  pageSize: number
): [RecentBlocks | null, boolean] {
  const [loading, setLoading] = useState(true);
  const [recentBlocks, setRecentBlocks] = useState<RecentBlocks | null>(null);
  const [{ rpcService }] = useRollappStore();
  const throwError = useThrowError();

  useEffect(() => {
    let ac: AbortController | null;
    if (!rpcService) throw new Error('Rpc Service is not available');

    (async function () {
      try {
        setLoading(true);

        const result = rpcService.getRecentBlocks(page + 1, pageSize);
        ac = result[1];
        const _recentBlocks = await getResponseResult(result[0]);

        setRecentBlocks(_recentBlocks);
        setLoading(false);
      } catch (e: any) {
        if (!isAbortException(e)) {
          console.log(e);
          throwError(new Error('Failed to fetch Recent Blocks'));
        }
      } finally {
        ac = null;
      }
    })();

    return () => {
      if (ac) ac.abort();
    };
  }, [rpcService, page, pageSize, throwError]);

  return [recentBlocks, loading];
}
