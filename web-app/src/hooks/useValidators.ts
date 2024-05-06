import { ValidatorList } from '@/consts/rpcResTypes';
import { getResponseResult } from '@/services/rpc.service';
import { useRollappStore } from '@/stores/rollappStore';
import { useEffect, useState } from 'react';
import { useThrowError } from './useThrowError';
import { isAbortException } from '@/utils/common';

export default function useValidators(): [ValidatorList, boolean] {
  const [loading, setLoading] = useState(true);
  const [validatorList, setValidatorList] = useState<ValidatorList>({});
  const [{ rpcService }] = useRollappStore();
  const throwError = useThrowError();

  useEffect(() => {
    let ac: AbortController | null;
    if (!rpcService) throw new Error('Rpc Service is not available');

    (async function () {
      try {
        setLoading(true);
        const result = rpcService.getValidators();
        ac = result[1];
        const validator = await getResponseResult(result[0]);
        setValidatorList(validator);
        setLoading(false);
      } catch (e: any) {
        if (!isAbortException(e)) {
          console.log(e);
          throwError(new Error('Failed to fetch Validators'));
        }
      } finally {
        ac = null;
      }
    })();

    return () => {
      if (ac) ac.abort();
    };
  }, [rpcService, throwError]);

  return [validatorList, loading];
}
