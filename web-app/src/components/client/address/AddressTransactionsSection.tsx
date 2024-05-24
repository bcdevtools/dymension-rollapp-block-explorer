'use client';

import Card from '@/components/commons/Card';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { AddressPageSearchParams, AddressTransactionType } from '@/consts/addressPage';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

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

  return (
    <Card>
      <Tabs value={txType} sx={{ mb: 3 }}>
        {transactionTabs.map(({ label, value }) => (
          <Tab
            component={Link}
            href={`${pathname}?${new URLSearchParams({
              [AddressPageSearchParams.TX_TYPE]: value,
            }).toString()}`}
            scroll={false}
            key={value}
            label={label}
            value={value}
          />
        ))}
      </Tabs>
      {children}
    </Card>
  );
}
