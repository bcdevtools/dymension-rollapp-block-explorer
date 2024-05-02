import { Block, RpcError } from '@/consts/rpcResTypes';
import { getResponseResult } from '@/services/rpc.service';
import { useRollappStore } from '@/stores/rollappStore';
import { useEffect, useState } from 'react';
import { useThrowError } from './useThrowError';
import { isAbortException } from '@/utils/common';

export function useBlockList<T extends boolean>(
  latestBlockNo: number,
  page: number,
  pageSize: number,
  shouldThrowError: T = true as T
): [(T extends true ? Block : Block | { error: RpcError })[], boolean] {
  const [loading, setLoading] = useState(true);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [{ rpcService }] = useRollappStore();
  const throwError = useThrowError();

  useEffect(() => {
    let ac: AbortController | null;
    if (!rpcService) throw new Error('Rpc Service is not available');

    if (latestBlockNo) {
      (async function () {
        try {
          setLoading(true);

          const topBlockNoInPage = latestBlockNo - page * pageSize;

          const result = rpcService.getBlockByNumber(
            Array.from(Array(Math.min(topBlockNoInPage, pageSize))).map(
              (i, idx) => topBlockNoInPage - idx
            )
          );
          ac = result[1];
          const _blocks = await getResponseResult(result[0], shouldThrowError);
          setBlocks(_blocks);
          setLoading(false);
        } catch (e: any) {
          if (!isAbortException(e)) {
            console.log(e);
            throwError(new Error('Failed to fetch Blocks'));
          }
        } finally {
          ac = null;
        }
      })();
    } else setBlocks([]);

    return () => {
      if (ac) ac.abort();
    };
  }, [latestBlockNo, rpcService, page, pageSize, throwError, shouldThrowError]);

  return [blocks, loading];
}
