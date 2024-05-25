import Card from '@/components/commons/Card';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { Transaction } from '@/consts/rpcResTypes';
import { useMemo, useState } from 'react';
import CosmosEventLogs from './_CosmosEventLogs';
import Messages from './_Messages';
import DefaultLoading from '@/components/commons/DefaultLoading';
import EvmDetails from './_EvmDetails';
import EvmReceiptDetails from './_EvmReceiptDetails';
import EvmEventLogs from './_EvmEventLogs';
import { TransactionType } from '@/consts/transaction';
import { getTransactionType } from '@/utils/transaction';
import Box from '@mui/material/Box';

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

function getTabsByTransaction(transaction: Transaction, transactionType: TransactionType) {
  switch (transactionType) {
    case 'cosmos':
    default:
      return [
        {
          label: transaction.msgs ? `Messages (${transaction.msgs.length}) ` : 'Messages',
          value: TabValue.MESSAGES,
        },
        { label: 'Event Logs', value: TabValue.COSMOS_EVENT_LOGS },
      ];
    case 'evm':
      return (function () {
        const tabs = [
          { label: 'Details', value: TabValue.EVM_DETAILS },
          { label: 'Receipt', value: TabValue.EVM_RECEIPT },
        ];
        if (transaction.evmReceipt?.logs?.length) {
          tabs.push({ label: 'EVM Event Logs', value: TabValue.EVM_EVENT_LOGS });
        }
        tabs.push({
          label: 'Cosmos Event Logs',
          value: TabValue.COSMOS_EVENT_LOGS,
        });
        return tabs;
      })();
  }
}

function getDefaultTabValue(transactionType: TransactionType) {
  switch (transactionType) {
    case 'cosmos':
      return TabValue.MESSAGES;
    case 'evm':
      return TabValue.EVM_DETAILS;
  }
}

export default function TransactionData({ transaction }: TransactionDataProps) {
  const [currentTab, setCurrentTab] = useState<TabValue | null>(null);
  const transactionType = useMemo(() => (transaction ? getTransactionType(transaction) : null), [transaction]);

  const tabValue = useMemo(() => currentTab || getDefaultTabValue(transactionType!), [transactionType, currentTab]);

  return (
    <Card>
      {!transaction || !transactionType ? (
        <DefaultLoading />
      ) : (
        <>
          <Box mb={3} borderBottom={1} borderColor="divider">
            <Tabs value={tabValue} onChange={(e, newValue) => setCurrentTab(newValue)}>
              {getTabsByTransaction(transaction, transactionType!).map(tab => (
                <Tab key={tab.value} label={tab.label} value={tab.value} />
              ))}
            </Tabs>
          </Box>
          <Box>
            {(function () {
              switch (tabValue) {
                case TabValue.MESSAGES:
                default:
                  return <Messages transaction={transaction} />;
                case TabValue.COSMOS_EVENT_LOGS:
                  return <CosmosEventLogs transaction={transaction} />;
                case TabValue.EVM_DETAILS:
                  return <EvmDetails transaction={transaction} />;
                case TabValue.EVM_RECEIPT:
                  return <EvmReceiptDetails transaction={transaction} />;
                case TabValue.EVM_EVENT_LOGS:
                  return <EvmEventLogs transaction={transaction} />;
              }
            })()}
          </Box>
        </>
      )}
    </Card>
  );
}
