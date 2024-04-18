import DataTable from '@/components/commons/DataTable';
import { ADDRESS_SUMMARY_COINS_PAGE_SIZE } from '@/consts/setting';
import useAccountBalances from '@/hooks/useAccountBalances';
import { toSortedDenoms } from '@/utils/address';
import { formatBlockchainAmount } from '@/utils/number';
import { useMemo, useState } from 'react';

export default function AddressCoins({
  address,
}: Readonly<{ address: string }>) {
  const [page, setPage] = useState(0);
  const [balances, loading] = useAccountBalances(address);

  const sortedDenoms = useMemo(
    () => (balances ? toSortedDenoms(balances) : []),
    [balances]
  );

  const body = sortedDenoms.map(denom => [
    denom,
    formatBlockchainAmount(balances![denom]),
  ]);

  return (
    <DataTable
      headers={['Denom', 'Balance']}
      body={body}
      rowKeys={sortedDenoms}
      total={sortedDenoms.length}
      page={page}
      pageSize={ADDRESS_SUMMARY_COINS_PAGE_SIZE}
      loading={loading}
      onPageChange={setPage}
      onRowsPerPageChange={() => {}}
    />
  );
}
