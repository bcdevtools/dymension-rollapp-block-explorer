import { getResponseResult } from '@/services/rpc.service';
import { useRollappStore } from '@/stores/rollappStore';
import { useEffect, useState } from 'react';
import { useThrowError } from './useThrowError';
import { isAbortException } from '@/utils/common';
import { RecentBlock } from '@/consts/rpcResTypes';

export type RecentBlocksHookResult = Required<{
  blocks: Required<RecentBlock>[];
  latestBlock: number;
}>;

export function useRecentBlocks(
  page: number,
  pageSize: number,
  { useFallback }: { useFallback: boolean } = { useFallback: false }
): [RecentBlocksHookResult | null, boolean] {
  const [loading, setLoading] = useState(true);
  const [recentBlocks, setRecentBlocks] =
    useState<RecentBlocksHookResult | null>(null);
  const [{ rpcService }] = useRollappStore();
  const throwError = useThrowError();

  useEffect(() => {
    let ac: AbortController | null;
    if (!rpcService) throw new Error('Rpc Service is not available');

    (async function () {
      setLoading(true);

      try {
        const result = rpcService.getRecentBlocks(page + 1, pageSize);
        ac = result[1];
        const _recentBlocks = await getResponseResult(result[0]);

        setRecentBlocks(_recentBlocks);
        setLoading(false);

        return;
      } catch (e: any) {
        if (!isAbortException(e)) {
          console.log(e);
          if (!useFallback) {
            throwError(new Error('Failed to fetch Recent Blocks'));
            return;
          }
        } else return;
      } finally {
        ac = null;
      }

      try {
        const latestBlockNumberResult = rpcService.getLatestBlockNumber();
        ac = latestBlockNumberResult[1];
        const lastestBlockRes = await getResponseResult(
          latestBlockNumberResult[0]
        );

        const { latestBlock } = lastestBlockRes;

        const topBlockNoInPage = latestBlock - page * pageSize;

        const getBlockByNumberResult = rpcService.getBlockByNumber(
          Array.from(Array(Math.min(topBlockNoInPage, pageSize))).map(
            (i, idx) => topBlockNoInPage - idx
          )
        );
        ac = getBlockByNumberResult[1];
        const _blocks = await getResponseResult(getBlockByNumberResult[0]);

        setRecentBlocks({
          blocks: _blocks.map(b => ({ ...b, txsCount: b.txs.length })),
          latestBlock,
        });

        setLoading(false);
      } catch (e: any) {
        if (!isAbortException(e)) {
          console.log(e);
          throwError(new Error('Failed to fetch Blocks'));
        }
      } finally {
        ac = null;
      }
    })();

    return () => {
      if (ac) ac.abort();
    };
  }, [rpcService, page, pageSize, throwError, useFallback]);

  return [recentBlocks, loading];
}
