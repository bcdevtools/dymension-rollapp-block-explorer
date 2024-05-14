import { getResponseResult } from '@/services/rpc.service';
import { useRollappStore } from '@/stores/rollappStore';
import { useEffect, useState } from 'react';
import { isAbortException } from '@/utils/common';
import { MODULES } from '@/consts/params';

export default function useModuleParams(module: string): [any, boolean] {
  const [loading, setLoading] = useState(true);
  const [moduleParams, setModuleParams] = useState<any>(null);
  const [{ rpcService }] = useRollappStore();

  useEffect(() => {
    let ac: AbortController | null;
    if (!rpcService) throw new Error('Rpc Service is not available');

    if (MODULES.includes(module)) {
      (async function () {
        try {
          setLoading(true);
          const result = rpcService.getModuleParams(module);
          ac = result[1];
          const _moduleParams = await getResponseResult(result[0], false);
          setModuleParams(_moduleParams);
          setLoading(false);
        } catch (e: any) {
          if (!isAbortException(e)) {
            console.log(e);
          }
        } finally {
          ac = null;
        }
      })();
    } else setModuleParams(null);

    return () => {
      if (ac) ac.abort();
    };
  }, [module, rpcService]);

  return [moduleParams, loading];
}
