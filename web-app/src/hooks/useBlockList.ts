import { Block } from '@/consts/rpcResTypes';
import { useRollappStore } from '@/stores/rollappStore';
import { useEffect, useState } from 'react';

export function useBlockList(
  latestBlockNo: number,
  page: number,
  pageSize: number
): [Block[], boolean] {
  const [loading, setLoading] = useState(true);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [{ rpcService }] = useRollappStore();

  useEffect(() => {
    const ac = new AbortController();
    let ignore = false;
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
          if (!ignore) setLoading(false);
        }
      })();
    } else setBlocks([]);
    return () => {
      ac.abort();
      ignore = true;
    };
  }, [latestBlockNo, rpcService, page, pageSize]);

  return [blocks, loading];
}