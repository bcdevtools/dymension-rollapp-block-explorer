import Card from '@/components/commons/Card';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { Transaction } from '@/consts/rpcResTypes';
import { useState } from 'react';
import CosmosEventLogs from './_CosmosEventLogs';
import Messages from './_Messages';
import DefaultLoading from '@/components/commons/DefaultLoading';
import EvmDetails from './_EvmDetails';
import EvmReceiptDetails from './_EvmReceiptDetails';
import EvmEventLogs from './_EvmEventLogs';

type TransactionDataProps = Readonly<{
  transaction: Transaction | null;
}>;

const enum TabValue {
  MESSAGES = 0,
  COSMOS_EVENT_LOGS = 1,
  EVM_DETAILS = 2,
  EVM_RECEIPT = 3,
  EVM_EVENT_LOGS = 4,
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
        <Tab label="Event Logs" value={TabValue.COSMOS_EVENT_LOGS} />
      </Tabs>
      {(function () {
        if (!transaction) return <DefaultLoading />;
        switch (currentTab) {
          case TabValue.MESSAGES:
          default:
            return <Messages transaction={transaction} />;
          case TabValue.COSMOS_EVENT_LOGS:
            return <CosmosEventLogs transaction={transaction} />;
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
        onChange={(_, newValue) => setCurrentTab(newValue)}>
        <Tab
          label="Details"
          value={TabValue.EVM_DETAILS}
        />
        <Tab
          label="Receipt"
          value={TabValue.EVM_RECEIPT}
        />
        {
          (transaction?.evmReceipt?.logs?.length || 0) > 0 &&
          <Tab label="EVM Event Logs" value={TabValue.EVM_EVENT_LOGS} />
        }
        <Tab label="Cosmos Event Logs" value={TabValue.COSMOS_EVENT_LOGS} />
      </Tabs>
      {(function () {
        if (!transaction) return <DefaultLoading />;
        switch (currentTab) {
          case TabValue.EVM_DETAILS:
          default:
            return <EvmDetails transaction={transaction} />;
          case TabValue.EVM_RECEIPT:
            return <EvmReceiptDetails transaction={transaction} />;
          case TabValue.EVM_EVENT_LOGS:
            return <EvmEventLogs transaction={transaction} />;
          case TabValue.COSMOS_EVENT_LOGS:
            return <CosmosEventLogs transaction={transaction} />;
        }
      })()}
    </Card>
  );
}