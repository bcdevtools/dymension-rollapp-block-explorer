import { DenomsMetadata } from '@/consts/rpcResTypes';
import { getResponseResult } from '@/services/rpc.service';
import { useRollappStore } from '@/stores/rollappStore';
import { useEffect, useState } from 'react';

export default function useDenomsMetadata(
  address: string
): [DenomsMetadata | null, boolean] {
  const [loading, setLoading] = useState(true);
  const [denomsMetadata, setDenomsMetadata] = useState<DenomsMetadata | null>(
    null
  );
  const [{ rpcService }] = useRollappStore();

  useEffect(() => {
    let ac: AbortController | null;
    if (rpcService && address) {
      (async function () {
        try {
          setLoading(true);
          const result = rpcService.getDenomsMetadata();
          ac = result[1];

          const _denomsMetadata = await getResponseResult(result[0]);

          setDenomsMetadata(_denomsMetadata);
          setLoading(false);
        } catch (e) {
          console.log(e);
        } finally {
          ac = null;
        }
      })();
    } else setDenomsMetadata(null);
    return () => {
      if (ac) ac.abort();
    };
  }, [address, rpcService]);

  return [denomsMetadata, loading];
}
