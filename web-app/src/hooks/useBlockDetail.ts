import { Block } from '@/consts/rpcResTypes';
import { getResponseResult } from '@/services/rpc.service';
import { useRollappStore } from '@/stores/rollappStore';
import { useEffect, useState } from 'react';

export default function useBlockDetail(
  blockNo: number
): [Block | null, boolean] {
  const [loading, setLoading] = useState(true);
  const [block, setBlock] = useState<Block | null>(null);
  const [{ rpcService }] = useRollappStore();

  useEffect(() => {
    let ac: AbortController | null;
    if (rpcService && blockNo) {
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
        } finally {
          ac = null;
        }
      })();
    } else setBlock(null);
    return () => {
      if (ac) ac.abort('useBlockDetail cleanup');
    };
  }, [blockNo, rpcService]);

  return [block, loading];
}
