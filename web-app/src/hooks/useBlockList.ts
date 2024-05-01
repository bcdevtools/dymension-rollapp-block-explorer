import { Block } from '@/consts/rpcResTypes';
import ErrorContext from '@/contexts/ErrorContext';
import { getResponseResult } from '@/services/rpc.service';
import { useRollappStore } from '@/stores/rollappStore';
import { useContext, useEffect, useState } from 'react';
import { useMountedState } from './useMountedState';

export function useBlockList(
  latestBlockNo: number,
  page: number,
  pageSize: number
): [Block[], boolean] {
  const [loading, setLoading] = useState(true);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [{ rpcService }] = useRollappStore();
  const { showErrorSnackbar } = useContext(ErrorContext);
  const mounted = useMountedState();

  useEffect(() => {
    let ac: AbortController | null;
    if (!rpcService) throw new Error('Cannot find Rpc Service');

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
          const _blocks = await getResponseResult(result[0]);
          setBlocks(_blocks);
          setLoading(false);
        } catch (e) {
          console.log(e);
          if (mounted.current) showErrorSnackbar('Failed to fetch blocks');
        } finally {
          ac = null;
          if (mounted.current) setLoading(false);
        }
      })();
    } else setBlocks([]);

    return () => {
      if (ac) ac.abort('useBlockList cleanup');
    };
  }, [latestBlockNo, rpcService, page, pageSize, showErrorSnackbar, mounted]);

  return [blocks, loading];
}
