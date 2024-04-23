'use client';

import { Transaction } from '@/consts/rpcResTypes';
import Typography from '@mui/material/Typography';
import { getNewPathByRollapp } from '@/utils/common';
import { usePathname } from 'next/navigation';
import { Path } from '@/consts/path';
import Link from '@mui/material/Link';
import { ItemContainer, RowItem } from './_Common';
import { fromHexStringToEthereumGasPriceValue } from '@/utils/transaction';
import { formatNumber, hexToDec } from '@/utils/number';
import { getAddress } from '@ethersproject/address';

export default function EvmReceiptDetails({
  transaction,
}: Readonly<{
  transaction: Transaction;
}>) {
  const pathname = usePathname();
  const evmReceiptInfo = transaction.evmReceipt;

  return (
    evmReceiptInfo && (
      <ItemContainer>
        <RowItem
          label="From"
          value={
            <Typography sx={{ fontStyle: 'italic' }}>
              {
                <Link
                  href={getNewPathByRollapp(
                    pathname,
                    `${Path.ADDRESS}/${evmReceiptInfo.from}`
                  )}
                  underline="hover"
                  sx={{ fontStyle: 'normal' }}>
                  {getAddress(evmReceiptInfo.from)}
                </Link>
              }
            </Typography>
          }
        />
        {evmReceiptInfo.to && (
          <RowItem
            label="To"
            value={
              <Typography sx={{ fontStyle: 'italic' }}>
                {
                  <Link
                    href={getNewPathByRollapp(
                      pathname,
                      `${Path.ADDRESS}/${evmReceiptInfo.to}`
                    )}
                    underline="hover"
                    sx={{ fontStyle: 'normal' }}>
                    {getAddress(evmReceiptInfo.to)}
                  </Link>
                }
              </Typography>
            }
          />
        )}
        {evmReceiptInfo.contractAddress && (
          <RowItem
            label="New Contract Address"
            value={
              <Typography sx={{ fontStyle: 'italic' }}>
                {
                  <Link
                    href={getNewPathByRollapp(
                      pathname,
                      `${Path.ADDRESS}/${evmReceiptInfo.contractAddress}`
                    )}
                    underline="hover"
                    sx={{ fontStyle: 'normal' }}>
                    {getAddress(evmReceiptInfo.contractAddress)}
                  </Link>
                }
              </Typography>
            }
          />
        )}
        <RowItem label="Status" value={evmReceiptInfo.status} />
        {evmReceiptInfo.cumulativeGasUsed && (
          <RowItem
            label="Cummulative Gas Used"
            value={formatNumber(hexToDec(evmReceiptInfo.cumulativeGasUsed))}
          />
        )}
        {evmReceiptInfo.effectiveGasPrice && (
          <RowItem
            label="Effective Gas Price"
            value={fromHexStringToEthereumGasPriceValue(
              evmReceiptInfo.effectiveGasPrice
            )}
          />
        )}
        <RowItem
          label="Gas Used"
          value={formatNumber(hexToDec(evmReceiptInfo.gasUsed))}
        />
        <RowItem label="Type" value={evmReceiptInfo.type} />
      </ItemContainer>
    )
  );
}
