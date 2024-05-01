import { DenomsMetadata } from '@/consts/rpcResTypes';
import ErrorContext from '@/contexts/ErrorContext';
import { getResponseResult } from '@/services/rpc.service';
import { useRollappStore } from '@/stores/rollappStore';
import { useContext, useEffect, useState } from 'react';
import { useMountedState } from './useMountedState';

export default function useDenomsMetadata(
  address: string
): [DenomsMetadata | null, boolean] {
  const [loading, setLoading] = useState(true);
  const [denomsMetadata, setDenomsMetadata] = useState<DenomsMetadata | null>(
    null
  );
  const [{ rpcService }] = useRollappStore();
  const { showErrorSnackbar } = useContext(ErrorContext);
  const mounted = useMountedState();

  useEffect(() => {
    let ac: AbortController | null;
    if (!rpcService) throw new Error('Cannot find Rpc Service');

    if (address) {
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
          if (mounted.current)
            showErrorSnackbar('Failed to fetch Denoms Metadata');
        } finally {
          ac = null;
          if (mounted.current) setLoading(false);
        }
      })();
    } else setDenomsMetadata(null);

    return () => {
      if (ac) ac.abort();
    };
  }, [address, rpcService, showErrorSnackbar, mounted]);

  return [denomsMetadata, loading];
}
