import { Validator } from '@/consts/rpcResTypes';
import { getResponseResult } from '@/services/rpc.service';
import { useRollappStore } from '@/stores/rollappStore';
import { useEffect, useState } from 'react';
import { useThrowError } from './useThrowError';
import { isAbortException } from '@/utils/common';

export default function useValidator(
  address: string
): [Validator | null, boolean] {
  const [loading, setLoading] = useState(true);
  const [validator, setValidator] = useState<Validator | null>(null);
  const [{ rpcService }] = useRollappStore();
  const throwError = useThrowError();

  useEffect(() => {
    let ac: AbortController | null;
    if (!rpcService) throw new Error('Rpc Service is not available');

    if (address) {
      (async function () {
        try {
          setLoading(true);
          const result = rpcService.getValidator(address);
          ac = result[1];
          const validator = await getResponseResult(result[0]);
          setValidator(validator);
          setLoading(false);
        } catch (e: any) {
          if (!isAbortException(e)) {
            console.log(e);
            throwError(new Error('Failed to fetch Governor'));
          }
        } finally {
          ac = null;
        }
      })();
    } else setValidator(null);

    return () => {
      if (ac) ac.abort();
    };
  }, [address, rpcService, throwError]);

  return [validator, loading];
}
