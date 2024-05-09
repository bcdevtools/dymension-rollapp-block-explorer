import { GovProposals } from '@/consts/rpcResTypes';
import { getResponseResult } from '@/services/rpc.service';
import { useRollappStore } from '@/stores/rollappStore';
import { useEffect, useState } from 'react';
import { useThrowError } from './useThrowError';
import { isAbortException } from '@/utils/common';

type Result = GovProposals | null;

export default function useGovProposals(page: number): [Result, boolean] {
  const [loading, setLoading] = useState(true);
  const [govProposals, setGovProposals] = useState<Result>(null);
  const [{ rpcService }] = useRollappStore();
  const throwError = useThrowError();

  useEffect(() => {
    let ac: AbortController | null;
    if (!rpcService) throw new Error('Rpc Service is not available');

    (async function () {
      try {
        setLoading(true);
        const result = rpcService.getGovProposals(page);
        ac = result[1];
        const _govProposal = await getResponseResult(result[0]);
        setGovProposals(_govProposal);
        setLoading(false);
      } catch (e: any) {
        if (!isAbortException(e)) {
          console.log(e);
          throwError(new Error('Failed to fetch Gov Proposals'));
        }
      } finally {
        ac = null;
      }
    })();

    return () => {
      if (ac) ac.abort();
    };
  }, [rpcService, throwError, page]);

  return [govProposals, loading];
}
