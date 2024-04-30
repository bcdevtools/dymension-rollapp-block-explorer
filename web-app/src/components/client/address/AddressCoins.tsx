import DataTable from '@/components/commons/DataTable';
import { ADDRESS_SUMMARY_COINS_PAGE_SIZE } from '@/consts/setting';
import AccountContext from '@/contexts/AccountContext';
import { toSortedDenoms } from '@/utils/address';
import { formatBlockchainAmount } from '@/utils/number';
import { useContext, useMemo, useState } from 'react';

export default function AddressCoins() {
  const [page, setPage] = useState(0);
  const { balancesWithMetadata: accountBalances, loading } =
    useContext(AccountContext);

  const [rowKeys, body] = useMemo((): [string[], [string, string][]] => {
    if (!accountBalances) return [[], []];
    const _rowKeys = toSortedDenoms(accountBalances);
    const _body = _rowKeys.map<[string, string]>(denom => {
      let _denom = denom;
      let _decimals = 0;
      if (accountBalances[denom].metadata) {
        _denom = accountBalances[denom].metadata!.symbol;
        _decimals = accountBalances[denom].metadata!.highestExponent;
      }
      return [
        _denom,
        formatBlockchainAmount(accountBalances[denom].balance, _decimals),
      ];
    });
    return [_rowKeys, _body];
  }, [accountBalances]);

  return (
    <DataTable
      headers={['Denom', 'Balance']}
      body={body}
      rowKeys={rowKeys}
      total={rowKeys.length}
      page={page}
      pageSize={ADDRESS_SUMMARY_COINS_PAGE_SIZE}
      loading={loading}
      loadingItems={1}
      onPageChange={setPage}
      onRowsPerPageChange={() => {}}
    />
  );
}
