import { useRollappStore } from '@/stores/rollappStore';
import { useEffect, useState } from 'react';
import { getResponseResult } from '@/services/rpc.service';
import { useThrowError } from './useThrowError';
import { isAbortException } from '@/utils/common';

export function useLatestBlock(
  autoRefresh: boolean = false,
  shouldThrowError: boolean = true
): [number, boolean] {
  const [latestBlockNo, setLatestBlockNo] = useState(0);
  const [loading, setLoading] = useState(true);
  const [{ rpcService, selectedRollappInfo }] = useRollappStore(true);
  const throwError = useThrowError();

  useEffect(() => {
    let ac: AbortController | null;
    let intervalId: NodeJS.Timeout | null = null;
    if (!rpcService) throw new Error('Rpc Service is not available');

    const fetchLatestBlock = async function () {
      try {
        const result = rpcService.getLatestBlockNumber();

        ac = result[1];
        const latestBlockResult = await getResponseResult(
          result[0],
          shouldThrowError
        );
        const _latestBlockNo = latestBlockResult.latestBlock
          ? latestBlockResult.latestBlock
          : Number(selectedRollappInfo!.latest_indexed_block);
        setLatestBlockNo(_latestBlockNo);
        setLoading(false);

        return result[1];
      } catch (e: any) {
        if (!isAbortException(e)) {
          console.log(e);
          throwError(new Error('Failed to fetch Latest Block'));
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
  }, [
    autoRefresh,
    rpcService,
    throwError,
    shouldThrowError,
    selectedRollappInfo,
  ]);

  return [latestBlockNo, loading];
}
