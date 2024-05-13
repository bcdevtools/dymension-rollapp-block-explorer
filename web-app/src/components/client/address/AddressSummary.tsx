'use client';

import Card from '@/components/commons/Card';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import React, { useState } from 'react';
import AddressCoins from './AddressCoins';
import { Account as DbAccount } from '@/services/db/accounts';
import AddressTokens from './AddressTokens';
import AddressNft from './AddressNfts';
import { Account } from '@/consts/rpcResTypes';
import AddressStaking from './AddressStaking';

const enum AccountSummaryTab {
  COINS = 'Coins',
  TOKENS = 'Tokens',
  NFTS = 'NFTs',
  STAKING = 'Staking',
}

type AccountSummaryProps = Readonly<{
  address: string;
  accountInfo: DbAccount | null;
  evmAddress: string | null;
  accountRpcData: Account | null;
}>;

function getContent(
  address: string,
  evmAddress: string | null,
  accountInfo: DbAccount | null,
  accountRpcData: Account | null,
  tab: AccountSummaryTab
) {
  switch (tab) {
    case AccountSummaryTab.TOKENS:
      return (
        <AddressTokens accountInfo={accountInfo!} evmAddress={evmAddress} />
      );
    case AccountSummaryTab.NFTS:
      return <AddressNft accountInfo={accountInfo!} />;
    case AccountSummaryTab.STAKING:
      return <AddressStaking accountStakingInfo={accountRpcData!.staking} />;
    case AccountSummaryTab.COINS:
    default:
      return <AddressCoins />;
  }
}

export default React.memo(function AddressSummary({
  address,
  accountInfo,
  evmAddress,
  accountRpcData,
}: AccountSummaryProps) {
  const [tab, setTab] = useState(AccountSummaryTab.COINS);

  return (
    <Card sx={{ mb: 3 }}>
      <Tabs
        value={tab}
        sx={{ mb: 3 }}
        onChange={(e, value) => void setTab(value)}>
        <Tab value={AccountSummaryTab.COINS} label={AccountSummaryTab.COINS} />
        {accountInfo && accountInfo.balance_on_erc20_contracts.length && (
          <Tab
            value={AccountSummaryTab.TOKENS}
            label={AccountSummaryTab.TOKENS}
          />
        )}
        {accountInfo && accountInfo.balance_on_nft_contracts.length && (
          <Tab value={AccountSummaryTab.NFTS} label={AccountSummaryTab.NFTS} />
        )}
        {accountRpcData && accountRpcData.staking &&
          (accountRpcData.staking.rewards ||
            Object.keys(accountRpcData.staking.staking).length) && (
            <Tab
              value={AccountSummaryTab.STAKING}
              label={AccountSummaryTab.STAKING}
            />
          )}
      </Tabs>
      {getContent(address, evmAddress, accountInfo, accountRpcData, tab)}
    </Card>
  );
});
