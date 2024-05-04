'use client';
import DataTable from '@/components/commons/DataTable';
import { AccountStaking as AccountStakingInfo } from '@/consts/rpcResTypes';
import { ADDRESS_SUMMARY_COINS_PAGE_SIZE } from '@/consts/setting';
import { formatBlockchainAmount } from '@/utils/number';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import { useState } from 'react';

export default function AddressStaking({
  accountStakingInfo,
}: Readonly<{ accountStakingInfo: AccountStakingInfo }>) {
  const [page, setPage] = useState(0);

  const validators = Object.keys(accountStakingInfo.staking);
  const body = Object.keys(accountStakingInfo.staking).map(validator => [
    validator,
    formatBlockchainAmount(
      accountStakingInfo.staking[
        validator as keyof AccountStakingInfo['staking']
      ]
    ),
  ]);

  return (
    <>
      <DataTable
        headers={['Validator', 'Delegated Amount']}
        body={body.slice(
          page * ADDRESS_SUMMARY_COINS_PAGE_SIZE,
          (page + 1) * ADDRESS_SUMMARY_COINS_PAGE_SIZE
        )}
        rowKeys={validators}
        total={validators.length}
        page={page}
        pageSize={ADDRESS_SUMMARY_COINS_PAGE_SIZE}
        loadingItems={1}
        onPageChange={setPage}
        onRowsPerPageChange={() => {}}
        summaryRows={
          <TableRow key="rewards">
            <TableCell colSpan={2} align="right">
              <strong>Total rewards: {accountStakingInfo.rewards}</strong>
            </TableCell>
          </TableRow>
        }
      />
    </>
  );
}
