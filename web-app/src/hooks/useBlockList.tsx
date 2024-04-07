import { Block } from '@/consts/rpcResTypes';
import { useRollappStore } from '@/stores/rollappStore';
import { useEffect, useState } from 'react';

export default function useBlockList(
  latestBlockNo: number,
  page: number,
  pageSize: number
): [Block[], boolean] {
  const [loading, setLoading] = useState(false);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [{ rpcService }] = useRollappStore();

  useEffect(() => {
    const ac = new AbortController();
    let ignore = false;
    if (rpcService && latestBlockNo) {
      (async function () {
        try {
          setLoading(true);
          const topPageBlockNo = latestBlockNo - page * pageSize;
          const _blocks = await rpcService.getBlockByNumber(
            Array.from(Array(Math.min(topPageBlockNo, pageSize))).map(
              (i, idx) => topPageBlockNo - idx
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
