import { GovProposal } from '@/consts/rpcResTypes';
import { getResponseResult } from '@/services/rpc.service';
import { useRollappStore } from '@/stores/rollappStore';
import { useEffect, useState } from 'react';
import { useThrowError } from './useThrowError';
import { isAbortException } from '@/utils/common';

type Result = GovProposal | null;

export default function useGovProposal(id: number): [Result, boolean] {
  const [loading, setLoading] = useState(true);
  const [govProposal, setGovProposal] = useState<Result>(null);
  const [{ rpcService }] = useRollappStore();
  const throwError = useThrowError();

  useEffect(() => {
    let ac: AbortController | null;
    if (!rpcService) throw new Error('Rpc Service is not available');

    (async function () {
      try {
        setLoading(true);
        const result = rpcService.getGovProposal(id);
        ac = result[1];
        const _govProposal = await getResponseResult(result[0]);
        setGovProposal(_govProposal);
        setLoading(false);
      } catch (e: any) {
        if (!isAbortException(e)) {
          console.log(e);
          throwError(new Error('Failed to fetch Gov Proposal'));
        }
      } finally {
        ac = null;
      }
    })();

    return () => {
      if (ac) ac.abort();
    };
  }, [rpcService, throwError, id]);

  return [govProposal, loading];
}
