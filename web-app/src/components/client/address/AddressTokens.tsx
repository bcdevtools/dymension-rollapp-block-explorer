import DataTable from '@/components/commons/DataTable';
import Link from '@/components/commons/Link';
import { Path } from '@/consts/path';
import { ADDRESS_SUMMARY_COINS_PAGE_SIZE } from '@/consts/setting';
import useTokenBalances from '@/hooks/useTokenBalances';
import { Account } from '@/services/db/accounts';
import { getNewPathByRollapp } from '@/utils/common';
import { formatBlockchainAmount } from '@/utils/number';
import { usePathname } from 'next/navigation';
import React, { useMemo, useState } from 'react';

export default function AddressTokens({
  accountInfo,
  evmAddress,
}: Readonly<{ accountInfo: Account; evmAddress: string | null }>) {
  const pathname = usePathname();
  const [page, setPage] = useState(0);

  const [tokenBalances, loading] = useTokenBalances(
    evmAddress || accountInfo.bech32_address,
    accountInfo.balance_on_erc20_contracts
  );

  const [rowKeys, body] = useMemo((): [
    string[],
    [React.ReactNode, string][]
  ] => {
    if (!tokenBalances) return [[], []];
    const sortedTokenBalances = [...tokenBalances].sort((a, b) =>
      a.display.localeCompare(b.display)
    );
    const _rowKeys = sortedTokenBalances.map<string>(
      tokenBalance => tokenBalance.contract
    );
    const _body = sortedTokenBalances.map<[React.ReactNode, string]>(
      tokenBalance => [
        <Link
          key={tokenBalance.contract}
          href={getNewPathByRollapp(
            pathname,
            `${Path.ADDRESS}/${tokenBalance.contract}`
          )}>
          {tokenBalance.display}
        </Link>,
        formatBlockchainAmount(tokenBalance.balance, tokenBalance.decimals),
      ]
    );
    return [_rowKeys, _body];
  }, [tokenBalances, pathname]);

  return (
    <DataTable
      headers={['Token', 'Balance']}
      body={body.slice(
        page * ADDRESS_SUMMARY_COINS_PAGE_SIZE,
        (page + 1) * ADDRESS_SUMMARY_COINS_PAGE_SIZE
      )}
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
