'use client';

import Card from '@/components/commons/Card';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import React, { useState } from 'react';
import AddressCoins from './AddressCoins';
import { Account } from '@/services/db/accounts';
import AddressTokens from './AddressTokens';
import AddressNft from './AddressNfts';

const enum AccountSummaryTab {
  COINS = 'Coins',
  TOKENS = 'Tokens',
  NFTS = 'NFTs',
}

type AccountSummaryProps = Readonly<{
  address: string;
  accountInfo: Account | null;
  evmAddress: string | null;
}>;

function getContent(
  address: string,
  evmAddress: string | null,
  accountInfo: Account | null,
  tab: AccountSummaryTab
) {
  switch (tab) {
    case AccountSummaryTab.COINS:
    default:
      return <AddressCoins />;
    case AccountSummaryTab.TOKENS:
      return (
        <AddressTokens accountInfo={accountInfo!} evmAddress={evmAddress} />
      );
    case AccountSummaryTab.NFTS:
      return <AddressNft accountInfo={accountInfo!} />;
  }
}

export default React.memo(function AddressSummary({
  address,
  accountInfo,
  evmAddress,
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
      </Tabs>
      {getContent(address, evmAddress, accountInfo, tab)}
    </Card>
  );
});
