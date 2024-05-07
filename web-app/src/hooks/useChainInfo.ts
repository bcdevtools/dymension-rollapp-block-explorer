import { ChainInfo } from '@/consts/rpcResTypes';
import { getResponseResult } from '@/services/rpc.service';
import { useRollappStore } from '@/stores/rollappStore';
import { useEffect, useState } from 'react';
import { useThrowError } from './useThrowError';
import { isAbortException } from '@/utils/common';

export default function useChainInfo(): [ChainInfo | null, boolean] {
  const [loading, setLoading] = useState(true);
  const [chainInfo, setChainInfo] = useState<ChainInfo | null>(null);
  const [{ rpcService }] = useRollappStore();
  const throwError = useThrowError();

  useEffect(() => {
    let ac: AbortController | null;
    if (!rpcService) throw new Error('Rpc Service is not available');

    (async function () {
      try {
        setLoading(true);
        const result = rpcService.getChainInfo();
        ac = result[1];
        const _chainInfo = await getResponseResult(result[0]);
        setChainInfo(_chainInfo);
        setLoading(false);
      } catch (e: any) {
        if (!isAbortException(e)) {
          console.log(e);
          throwError(new Error('Failed to fetch Chain Info'));
        }
      } finally {
        ac = null;
      }
    })();

    return () => {
      if (ac) ac.abort();
    };
  }, [rpcService, throwError]);

  return [chainInfo, loading];
}
