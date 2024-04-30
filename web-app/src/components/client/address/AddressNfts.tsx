import DataTable from '@/components/commons/DataTable';
import Link from '@/components/commons/Link';
import { Path } from '@/consts/path';
import { ADDRESS_SUMMARY_COINS_PAGE_SIZE } from '@/consts/setting';
import useAccounts from '@/hooks/useAccounts';
import { Account } from '@/services/db/accounts';
import { getNewPathByRollapp } from '@/utils/common';
import { usePathname } from 'next/navigation';
import React, { useMemo, useState } from 'react';

export default function AddressNft({
  accountInfo,
}: Readonly<{ accountInfo: Account }>) {
  const [page, setPage] = useState(0);
  const pathname = usePathname();
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
        <Link
          key={a.address.cosmos}
          href={getNewPathByRollapp(
            pathname,
            `${Path.ADDRESS}/${a.address.evm || a.address.cosmos}`
          )}>
          {a.contract?.name || a.address.evm || a.address.cosmos}
        </Link>,
      ]),
    ];
  }, [nfts, pathname]);

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
