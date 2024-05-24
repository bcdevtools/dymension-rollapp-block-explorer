import { DenomsMetadata } from '@/consts/rpcResTypes';
import { getResponseResult } from '@/services/rpc.service';
import { useRollappStore } from '@/stores/rollappStore';
import { useEffect, useState } from 'react';
import { useThrowError } from './useThrowError';
import { isAbortException } from '@/utils/common';
import { RollappActionTypes } from '@/consts/actionTypes';

export default function useDenomsMetadata(shouldThrowError: boolean = false): [DenomsMetadata, boolean] {
  const [{ denomsMetadata, hasGottenDenomsMetadata }, dispatch] = useRollappStore();
  const [loading, setLoading] = useState(!hasGottenDenomsMetadata);
  const [{ rpcService }] = useRollappStore();
  const throwError = useThrowError();

  useEffect(() => {
    let ac: AbortController | null;
    if (hasGottenDenomsMetadata) {
      if (loading) setLoading(false);
      return;
    }

    (async function () {
      try {
        if (!rpcService) throw new Error('Rpc Service is not available');
        setLoading(true);
        const result = rpcService.getDenomsMetadata();
        ac = result[1];

        const _denomsMetadata = await getResponseResult(result[0]);
        dispatch(RollappActionTypes.UPDATE_DENOMS_METADATA, _denomsMetadata);
        setLoading(false);
      } catch (e: any) {
        if (!isAbortException(e)) {
          if (shouldThrowError) {
            console.log(e);
            throwError(new Error('Failed to fetch Denoms Metadata'));
          } else setLoading(false);
        }
      } finally {
        ac = null;
      }
    })();

    return () => {
      if (ac) ac.abort();
    };
  }, [denomsMetadata, dispatch, rpcService, throwError, shouldThrowError, hasGottenDenomsMetadata, loading]);

  return [denomsMetadata, loading];
}
