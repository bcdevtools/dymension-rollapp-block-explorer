'use client';

import useBlockDetail from '@/hooks/useBlockDetail';
import TransactionListTable from './TransactionListTable';
import { useSearchParams } from 'next/navigation';
import { PAGE_PARAM_NAME, PAGE_SIZE_PARAM_NAME } from '@/consts/setting';
import { getPageAndPageSizeFromStringParam } from '@/utils/common';

export default function TransactionListByBlockNo({
  blockNo,
}: Readonly<{ blockNo: number }>) {
  const [block, loading] = useBlockDetail(blockNo);
  const searchParams = useSearchParams();

  const [pageSize, page] = getPageAndPageSizeFromStringParam(
    searchParams.get(PAGE_SIZE_PARAM_NAME),
    searchParams.get(PAGE_PARAM_NAME),
    block?.txs.length || 0
  );

  return (
    <TransactionListTable
      transactions={
        !block
          ? []
          : block.txs.slice(page * pageSize, (page + 1) * pageSize).map(tx => ({
              height: block.height,
              hash: tx.hash,
              epoch: block.timeEpochUTC,
              tx_type: tx.type,
              action: null,
              message_types: tx.messages,
            }))
      }
      loading={loading}
      totalTransactions={block?.txs.length}
      pageSize={pageSize}
      page={page}
    />
  );
}