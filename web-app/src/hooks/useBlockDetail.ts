import { Block } from '@/consts/rpcResTypes';
import { getResponseResult } from '@/services/rpc.service';
import { useRollappStore } from '@/stores/rollappStore';
import { useEffect, useState } from 'react';
import { useThrowError } from './useThrowError';
import { isAbortException } from '@/utils/common';

export default function useBlockDetail(blockNo: number): [Block | null, boolean] {
  const [loading, setLoading] = useState(true);
  const [block, setBlock] = useState<Block | null>(null);
  const [{ rpcService }] = useRollappStore();
  const throwError = useThrowError();

  useEffect(() => {
    let ac: AbortController | null;
    if (!rpcService) throw new Error('Rpc Service is not available');

    if (blockNo) {
      (async function () {
        try {
          setLoading(true);

          const result = rpcService.getBlockByNumber(blockNo);
          ac = result[1];
          const _block = await getResponseResult(result[0]);
          setBlock(_block);
          setLoading(false);
        } catch (e: any) {
          if (!isAbortException(e)) {
            console.log(e);
            throwError(new Error('Failed to fetch Block Detail'));
          }
        } finally {
          ac = null;
        }
      })();
    } else setBlock(null);

    return () => {
      if (ac) ac.abort();
    };
  }, [blockNo, rpcService, throwError]);

  return [block, loading];
}
