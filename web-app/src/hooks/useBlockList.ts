import { Block } from '@/consts/rpcResTypes';
import { useRollappStore } from '@/stores/rollappStore';
import { useEffect, useState } from 'react';
import { useMountedState } from './useMountedState';

export function useBlockList(
  latestBlockNo: number,
  page: number,
  pageSize: number
): [Block[], boolean] {
  const [loading, setLoading] = useState(true);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [{ rpcService }] = useRollappStore();
  const mounted = useMountedState();
  useEffect(() => {
    const ac = new AbortController();
    if (rpcService && latestBlockNo) {
      (async function () {
        try {
          setLoading(true);
          const topBlockNoInPage = latestBlockNo - page * pageSize;
          const _blocks = await rpcService.getBlockByNumber(
            Array.from(Array(Math.min(topBlockNoInPage, pageSize))).map(
              (i, idx) => topBlockNoInPage - idx
            ),
            { signal: ac.signal }
          );
          setBlocks(_blocks);
        } catch (e) {
          console.log(e);
        } finally {
          if (mounted.current) setLoading(false);
        }
      })();
    } else setBlocks([]);
    return () => {
      ac.abort();
    };
  }, [latestBlockNo, rpcService, page, pageSize, mounted]);

  return [blocks, loading];
}
