import Card from '@/components/commons/Card';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { Transaction } from '@/consts/rpcResTypes';
import { useState } from 'react';
import EventLogs from './_EventLogs';
import Messages from './_Messages';
import DefaultLoading from '@/components/commons/DefaultLoading';

type TransactionDataProps = Readonly<{
  transaction: Transaction | null;
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
          label={
            transaction ? `Messages (${transaction.msgs.length})` : 'Messages'
          }
          value={TabValue.MESSAGES}
        />
        <Tab label="Event Logs" value={TabValue.EVENT_LOGS} />
      </Tabs>
      {(function () {
        if (!transaction) return <DefaultLoading />;
        switch (currentTab) {
          case TabValue.MESSAGES:
          default:
            return <Messages transaction={transaction} />;
          case TabValue.EVENT_LOGS:
            return <EventLogs transaction={transaction} />;
        }
      })()}
    </Card>
  );
}
