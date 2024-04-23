'use client';

import { Transaction } from '@/consts/rpcResTypes';
import Typography from '@mui/material/Typography';
import { getNewPathByRollapp } from '@/utils/common';
import { usePathname } from 'next/navigation';
import { Path } from '@/consts/path';
import Link from '@mui/material/Link';
import { RowItem, fromHexStringToEthereumGasPriceValue } from './_Common';

export default function EvmReceiptDetails({
  transaction,
}: Readonly<{
  transaction: Transaction;
}>) {
  const pathname = usePathname();
  const evmReceiptInfo = transaction?.evmReceipt;
  if (!evmReceiptInfo) {
    return <>Error: no EVM receipt details to show</>;
  }

  return (
    <>
    <RowItem label="From" 
        value={
            <Typography sx={{ fontStyle: 'italic' }}>
                {<Link
                href={getNewPathByRollapp(
                    pathname,
                    `${Path.ADDRESS}/${evmReceiptInfo.from}`
                )}
                underline="hover"
                sx={{ fontStyle: 'normal' }}>
                {evmReceiptInfo.from}
                </Link>}
            </Typography>
        }
    />
    {
      evmReceiptInfo.to &&
      <RowItem label="To" 
          value={
              <Typography sx={{ fontStyle: 'italic' }}>
                  {<Link
                  href={getNewPathByRollapp(
                      pathname,
                      `${Path.ADDRESS}/${evmReceiptInfo.to}`
                  )}
                  underline="hover"
                  sx={{ fontStyle: 'normal' }}>
                  {evmReceiptInfo.to}
                  </Link>}
              </Typography>
          }
      />
    }
    {
      evmReceiptInfo.contractAddress &&
      <RowItem label="New Contract Address" 
          value={
              <Typography sx={{ fontStyle: 'italic' }}>
                  {<Link
                  href={getNewPathByRollapp(
                      pathname,
                      `${Path.ADDRESS}/${evmReceiptInfo.contractAddress}`
                  )}
                  underline="hover"
                  sx={{ fontStyle: 'normal' }}>
                  {evmReceiptInfo.contractAddress}
                  </Link>}
              </Typography>
          }
      />
    }
    <RowItem label="Status" value={evmReceiptInfo.status} />
    {
      evmReceiptInfo.cumulativeGasUsed &&
      <RowItem label="Cummulative Gas Used" value={Number(evmReceiptInfo.cumulativeGasUsed)} />
    }
    {
      evmReceiptInfo.effectiveGasPrice &&
      <RowItem label="Effective Gas Price" value={fromHexStringToEthereumGasPriceValue(evmReceiptInfo.effectiveGasPrice)} />
    }
    <RowItem label="Gas Used" value={Number(evmReceiptInfo.gasUsed)} />
    <RowItem label="Type" value={evmReceiptInfo.type} />
    </>
  );
}
