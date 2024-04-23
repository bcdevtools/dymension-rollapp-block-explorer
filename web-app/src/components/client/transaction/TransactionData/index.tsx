import Card from '@/components/commons/Card';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { Transaction } from '@/consts/rpcResTypes';
import { useState } from 'react';
import EventLogs from './_EventLogs';
import Messages from './_Messages';
import DefaultLoading from '@/components/commons/DefaultLoading';
import EvmDetails from './_EvmDetails';
import EvmReceiptDetails from './_EvmReceiptDetails';

type TransactionDataProps = Readonly<{
  transaction: Transaction | null;
}>;

const enum TabValue {
  MESSAGES = 0,
  EVENT_LOGS = 1,
  EVM_DETAILS = 2,
  EVM_RECEIPT = 3,
}

export default function TransactionData({ transaction }: TransactionDataProps) {
  if (transaction?.hash.length === 64) return CosmosTransactionData({ transaction });
  return EvmTransactionData({ transaction });
}

function CosmosTransactionData({ transaction }: TransactionDataProps) {
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

function EvmTransactionData({ transaction }: TransactionDataProps) {
  const [currentTab, setCurrentTab] = useState(TabValue.MESSAGES);
  return (
    <Card>
      <Tabs
        value={currentTab}
        sx={{ mb: 2 }}
        onChange={(e, newValue) => setCurrentTab(newValue)}>
        <Tab
          label="Details"
          value={TabValue.EVM_DETAILS}
        />
        <Tab
          label="Receipt"
          value={TabValue.EVM_RECEIPT}
        />
        <Tab label="Event Logs" value={TabValue.EVENT_LOGS} />
      </Tabs>
      {(function () {
        if (!transaction) return <DefaultLoading />;
        switch (currentTab) {
          case TabValue.EVM_DETAILS:
          default:
            return <EvmDetails transaction={transaction} />;
          case TabValue.EVM_RECEIPT:
            return <EvmReceiptDetails transaction={transaction} />;
          case TabValue.EVENT_LOGS:
            return <EventLogs transaction={transaction} />;
        }
      })()}
    </Card>
  );
}