import { useRollappStore } from '@/stores/rollappStore';
import { useEffect, useState } from 'react';

export function useLatestBlock(): [number, boolean] {
  const [latestBlockNo, setLatestBlockNo] = useState(0);
  const [loading, setLoading] = useState(true);
  const [{ rpcService }] = useRollappStore(true);

  useEffect(() => {
    if (!rpcService) {
      setLatestBlockNo(0);
      return;
    }

    let ignore = false;
    const ac = new AbortController();

    (async function () {
      try {
        const chainInfo = await rpcService.getChainInfo({
          signal: ac.signal,
        });
        setLatestBlockNo(chainInfo.latestBlock);
      } catch (e) {
        console.log(e);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
      ac.abort();
    };
  }, [rpcService]);

  return [latestBlockNo, loading];
}
