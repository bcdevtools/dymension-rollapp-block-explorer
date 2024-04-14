'use client';

import Card from '@/components/commons/Card';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import {
  AddressPageSearchParams,
  AddressTransactionType,
} from '@/consts/addressPage';
import Box from '@mui/material/Box';
import { usePathname, useRouter } from 'next/navigation';

const transactionTabs = [
  { value: AddressTransactionType.TRANSACTIONS, label: 'Transactions' },
  {
    value: AddressTransactionType.SENT_TRANSACTIONS,
    label: 'Sent Transactions',
  },
  { value: AddressTransactionType.ERC20_TRANSFER, label: 'Token Transfers' },
  { value: AddressTransactionType.NFT_TRANSFER, label: 'NFT Transfers' },
];

type AddressTransactionsSectionProps = Readonly<{
  children: React.ReactNode;
  txType: AddressTransactionType;
}>;

export default function AddressTransactionsSection({
  children,
  txType = AddressTransactionType.TRANSACTIONS,
}: AddressTransactionsSectionProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Card>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={txType}
          onChange={(e, newValue) => {
            const newSearchParams = new URLSearchParams(
              newValue && {
                [AddressPageSearchParams.TX_TYPE]: newValue,
              }
            );
            router.push(`${pathname}?${newSearchParams.toString()}`, {
              scroll: false,
            });
          }}>
          {transactionTabs.map(({ label, value }) => (
            <Tab key={value} label={label} value={value} />
          ))}
        </Tabs>
      </Box>
      {children}
    </Card>
  );
}
