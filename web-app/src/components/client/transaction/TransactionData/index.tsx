import Card from '@/components/commons/Card';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { Transaction } from '@/consts/rpcResTypes';
import { useState } from 'react';
import EventLogs from './_EventLogs';
import Messages from './_Messages';

type TransactionDataProps = Readonly<{
  transaction: Transaction;
}>;

const enum TabValue {
  MESSAGES = 0,
  EVENT_LOGS = 1,
}

export default function TransactionData({ transaction }: TransactionDataProps) {
  const [currentTab, setCurrentTab] = useState(TabValue.MESSAGES);
  return (
    <Card>
      <Tabs
        value={currentTab}
        sx={{ mb: 2 }}
        onChange={(e, newValue) => setCurrentTab(newValue)}>
        <Tab
          label={`Messages (${transaction.msgs.length})`}
          value={TabValue.MESSAGES}
        />
        <Tab label="Event Logs" value={TabValue.EVENT_LOGS} />
      </Tabs>
      {currentTab === TabValue.MESSAGES ? (
        <Messages transaction={transaction} />
      ) : (
        <EventLogs transaction={transaction} />
      )}
    </Card>
  );
}
