'use client';
import DataTable from '@/components/commons/DataTable';
import { AccountStaking as AccountStakingInfo } from '@/consts/rpcResTypes';
import { ADDRESS_SUMMARY_COINS_PAGE_SIZE } from '@/consts/setting';
import useDenomsMetadata from '@/hooks/useDenomsMetadata';
import { useRollappStore } from '@/stores/rollappStore';
import { getAmountFromReward, getDenomFromReward } from '@/utils/common';
import { formatBlockchainAmount } from '@/utils/number';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import { JsonObject } from '@prisma/client/runtime/library';
import { useMemo, useState } from 'react';

export default function AddressStaking({
  accountStakingInfo,
}: Readonly<{ accountStakingInfo: AccountStakingInfo }>) {
  const [page, setPage] = useState(0);
  const [{ selectedRollappInfo }] = useRollappStore();
  const [denomsMetadata, denomsMetadataLoading] = useDenomsMetadata();

  const denomMetadata = useMemo(
    () =>
      denomsMetadata &&
      denomsMetadata[
        (selectedRollappInfo!.denoms as JsonObject).bond as string
      ],
    [selectedRollappInfo, denomsMetadata]
  );
  const validators = Object.keys(accountStakingInfo.staking);
  const body = Object.keys(accountStakingInfo.staking).map(validator => [
    validator,
    `${formatBlockchainAmount(
      accountStakingInfo.staking[
        validator as keyof AccountStakingInfo['staking']
      ],
      denomMetadata ? denomMetadata.highestExponent : 0
    )} ${denomMetadata?.symbol}`,
  ]);

  const totalReward = useMemo(() => {
    const rewardAmount = getAmountFromReward(accountStakingInfo.rewards);
    const rewardDenom = getDenomFromReward(accountStakingInfo.rewards);

    if (!rewardDenom || !denomsMetadata)
      return formatBlockchainAmount(rewardAmount);
    const rewardDenomMetadata = denomsMetadata[rewardDenom];
    return `${formatBlockchainAmount(
      rewardAmount,
      rewardDenomMetadata.highestExponent
    )} ${rewardDenomMetadata.symbol}`;
  }, [accountStakingInfo.rewards, denomsMetadata]);

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
        loading={denomsMetadataLoading}
        loadingItems={1}
        onPageChange={setPage}
        onRowsPerPageChange={() => {}}
        summaryRows={
          <TableRow key="rewards">
            <TableCell colSpan={2} align="right">
              <strong>Total rewards: {totalReward}</strong>
            </TableCell>
          </TableRow>
        }
      />
    </>
  );
}
