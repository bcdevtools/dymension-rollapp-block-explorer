import { Block } from '@/consts/rpcResTypes';
import ErrorContext from '@/contexts/ErrorContext';
import { getResponseResult } from '@/services/rpc.service';
import { useRollappStore } from '@/stores/rollappStore';
import { useContext, useEffect, useState } from 'react';
import { useMountedState } from './useMountedState';

export default function useBlockDetail(
  blockNo: number
): [Block | null, boolean] {
  const [loading, setLoading] = useState(true);
  const [block, setBlock] = useState<Block | null>(null);
  const [{ rpcService }] = useRollappStore();
  const { showErrorSnackbar } = useContext(ErrorContext);
  const mounted = useMountedState();

  useEffect(() => {
    let ac: AbortController | null;
    if (!rpcService) throw new Error('Cannot find Rpc Service');

    if (blockNo) {
      (async function () {
        try {
          setLoading(true);

          const result = rpcService.getBlockByNumber(blockNo);
          ac = result[1];
          const _block = await getResponseResult(result[0]);
          setBlock(_block);
          setLoading(false);
        } catch (e) {
          console.log(e);
          if (mounted.current)
            showErrorSnackbar('Failed to fetch Block Detail');
        } finally {
          ac = null;
          if (mounted.current) setLoading(false);
        }
      })();
    } else setBlock(null);

    return () => {
      if (ac) ac.abort('useBlockDetail cleanup');
    };
  }, [blockNo, rpcService, showErrorSnackbar, mounted]);

  return [block, loading];
}
