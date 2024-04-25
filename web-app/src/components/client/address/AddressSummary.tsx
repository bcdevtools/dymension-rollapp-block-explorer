'use client';

import Card from '@/components/commons/Card';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useState } from 'react';
import AddressCoins from './AddressCoins';

const enum AccountSummaryTab {
  COINS = 'Coins',
  TOKENS = 'Tokens',
}

function getContent(address: string, tab: AccountSummaryTab) {
  switch (tab) {
    case AccountSummaryTab.COINS:
    default:
      return <AddressCoins address={address} />;
    case AccountSummaryTab.TOKENS:
      return <></>;
  }
}

export default function AddressSummary({
  address,
}: Readonly<{ address: string }>) {
  const [tab, setTab] = useState(AccountSummaryTab.COINS);

  return (
    <>
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={tab}
          sx={{ mb: 3 }}
          onChange={(e, value) => void setTab(value)}>
          <Tab
            value={AccountSummaryTab.COINS}
            label={AccountSummaryTab.COINS}
          />
          <Tab
            value={AccountSummaryTab.TOKENS}
            label={AccountSummaryTab.TOKENS}
          />
        </Tabs>
        {getContent(address, tab)}
      </Card>
    </>
  );
}
