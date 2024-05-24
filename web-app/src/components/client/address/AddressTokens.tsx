import DataTable from '@/components/commons/DataTable';
import { ADDRESS_SUMMARY_COINS_PAGE_SIZE } from '@/consts/setting';
import useTokenBalances from '@/hooks/useTokenBalances';
import { Account } from '@/services/db/accounts';
import { formatBlockchainAmount } from '@/utils/number';
import React, { useMemo, useState } from 'react';
import AddressLink from './AddressLink';

export default function AddressTokens({
  accountInfo,
  evmAddress,
}: Readonly<{ accountInfo: Account; evmAddress: string | null }>) {
  const [page, setPage] = useState(0);
  const slicedErc20Contract = useMemo(
    () =>
      accountInfo.balance_on_erc20_contracts.slice(
        page * ADDRESS_SUMMARY_COINS_PAGE_SIZE,
        (page + 1) * ADDRESS_SUMMARY_COINS_PAGE_SIZE,
      ),
    [page, accountInfo.balance_on_erc20_contracts],
  );

  const [tokenBalances, loading] = useTokenBalances(evmAddress || accountInfo.bech32_address, slicedErc20Contract);

  const [rowKeys, body] = useMemo((): [string[], [React.ReactNode, string][]] => {
    if (!tokenBalances) return [[], []];
    const _rowKeys = tokenBalances.map<string>(tokenBalance => tokenBalance.contract);
    const _body = tokenBalances.map<[React.ReactNode, string]>(tokenBalance => [
      <AddressLink
        key={tokenBalance.contract}
        address={tokenBalance.contract}
        display={tokenBalance.display}
        showCopyButton={false}
      />,
      formatBlockchainAmount(tokenBalance.balance, tokenBalance.decimals),
    ]);
    return [_rowKeys, _body];
  }, [tokenBalances]);

  return (
    <DataTable
      headers={['Token', 'Balance']}
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
