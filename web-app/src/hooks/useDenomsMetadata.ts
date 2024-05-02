import { DenomsMetadata } from '@/consts/rpcResTypes';
import { getResponseResult } from '@/services/rpc.service';
import { useRollappStore } from '@/stores/rollappStore';
import { useEffect, useState } from 'react';
import { useThrowError } from './useThrowError';
import { isAbortException } from '@/utils/common';

export default function useDenomsMetadata(
  address: string
): [DenomsMetadata | null, boolean] {
  const [loading, setLoading] = useState(true);
  const [denomsMetadata, setDenomsMetadata] = useState<DenomsMetadata | null>(
    null
  );
  const [{ rpcService }] = useRollappStore();
  const throwError = useThrowError();

  useEffect(() => {
    let ac: AbortController | null;
    if (!rpcService) throw new Error('Rpc Service is not available');

    if (address) {
      (async function () {
        try {
          setLoading(true);
          const result = rpcService.getDenomsMetadata();
          ac = result[1];

          const _denomsMetadata = await getResponseResult(result[0]);

          setDenomsMetadata(_denomsMetadata);
          setLoading(false);
        } catch (e: any) {
          if (!isAbortException(e)) {
            console.log(e);
            throwError(new Error('Failed to fetch Denoms Metadata'));
          }
        } finally {
          ac = null;
        }
      })();
    } else setDenomsMetadata(null);

    return () => {
      if (ac) ac.abort();
    };
  }, [address, rpcService, throwError]);

  return [denomsMetadata, loading];
}
