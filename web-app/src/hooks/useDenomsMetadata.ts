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

        const denomsMetadata: DenomsMetadata = {};

        let pageNumber: number = 1;
        for(;;) {
          const result = rpcService.getDenomsMetadata(pageNumber);
          ac = result[1];
  
          const _denomsMetadata = await getResponseResult(result[0]);
          const keys = Object.keys(_denomsMetadata);

          for (const key of keys) {
            denomsMetadata[key] = _denomsMetadata[key];
          }
  
          if (keys.length >= 20) { // magic number: 20 is the maximum records per page returned by API, read: https://github.com/bcdevtools/block-explorer-rpc-cosmos/blob/main/be_rpc/backend/utils.go#L7C1-L7C6
            pageNumber++;
            continue;
          }

          break;
        }

        dispatch(RollappActionTypes.UPDATE_DENOMS_METADATA, denomsMetadata);
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
