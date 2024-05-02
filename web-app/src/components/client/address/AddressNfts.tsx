import AddressLink from '@/components/client/address/AddressLink';
import DataTable from '@/components/commons/DataTable';
import { ADDRESS_SUMMARY_COINS_PAGE_SIZE } from '@/consts/setting';
import useAccounts from '@/hooks/useAccounts';
import { Account } from '@/services/db/accounts';
import React, { useMemo, useState } from 'react';

export default function AddressNft({
  accountInfo,
}: Readonly<{ accountInfo: Account }>) {
  const [page, setPage] = useState(0);
  const [nfts, loading] = useAccounts(accountInfo.balance_on_nft_contracts);

  const [rowKeys, body] = useMemo(() => {
    const sorted = [...nfts].sort((a, b) => {
      const aName = a.contract?.name || '';
      const bName = b.contract?.name || '';

      if (aName && bName) return aName.localeCompare(bName);
      else if (aName && !bName) return -1;
      else if (!aName && bName) return 1;
      else
        return (a.address.evm || a.address.cosmos).localeCompare(
          b.address.evm || b.address.cosmos
        );
    });
    return [
      sorted.map(a => a.address.cosmos),
      sorted.map<[React.ReactNode]>(a => [
        <AddressLink
          key={a.address.cosmos}
          address={a.address.evm || a.address.cosmos}
          display={a.contract?.name}
        />,
      ]),
    ];
  }, [nfts]);

  return (
    <DataTable
      headers={['NFT Contract']}
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
