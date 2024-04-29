'use client';

import Card from '@/components/commons/Card';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useState } from 'react';
import AddressCoins from './AddressCoins';
import { Account } from '@/services/db/accounts';
import AddressTokens from './AddressTokens';

const enum AccountSummaryTab {
  COINS = 'Coins',
  TOKENS = 'Tokens',
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
      return <AddressCoins address={address} />;
    case AccountSummaryTab.TOKENS:
      return (
        <AddressTokens accountInfo={accountInfo!} evmAddress={evmAddress} />
      );
  }
}

export default function AddressSummary({
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
      </Tabs>
      {getContent(address, evmAddress, accountInfo, tab)}
    </Card>
  );
}
