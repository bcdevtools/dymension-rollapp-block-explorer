import { Block } from '@/consts/rpcResTypes';
import { useRollappStore } from '@/stores/rollappStore';
import { useEffect, useState } from 'react';
import { useMountedState } from './useMountedState';

export default function useBlockDetail(
  blockNo: number
): [Block | null, boolean] {
  const [loading, setLoading] = useState(true);
  const [block, setBlock] = useState<Block | null>(null);
  const [{ rpcService }] = useRollappStore();

  useEffect(() => {
    const ac = new AbortController();
    if (rpcService && blockNo) {
      (async function () {
        try {
          setLoading(true);
          const _block = await rpcService.getBlockByNumber(blockNo, {
            signal: ac.signal,
          });
          setBlock(_block);
          setLoading(false);
        } catch (e) {
          console.log(e);
        }
      })();
    } else setBlock(null);
    return () => {
      ac.abort();
    };
  }, [blockNo, rpcService]);

  return [block, loading];
}
