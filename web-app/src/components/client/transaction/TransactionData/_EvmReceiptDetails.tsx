'use client';

import { Transaction } from '@/consts/rpcResTypes';
import Typography from '@mui/material/Typography';
import { getNewPathByRollapp } from '@/utils/common';
import { usePathname } from 'next/navigation';
import { Path } from '@/consts/path';
import { ItemContainer, RowItem } from './_Common';
import { fromHexStringToEthereumGasPriceValue } from '@/utils/transaction';
import { formatNumber, hexToDec } from '@/utils/number';
import { getAddress } from '@ethersproject/address';
import Link from '@/components/commons/Link';
import CopyButton from '../../commons/CopyButton';

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
                <>
                <Link
                  href={getNewPathByRollapp(
                    pathname,
                    `${Path.ADDRESS}/${evmReceiptInfo.from}`
                  )}
                  sx={{ fontStyle: 'normal' }}>
                  {getAddress(evmReceiptInfo.from)}
                </Link>
                <CopyButton
                size="small"
                textToCopy={evmReceiptInfo.from}/>
                </>
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
                  <>
                  <Link
                    href={getNewPathByRollapp(
                      pathname,
                      `${Path.ADDRESS}/${evmReceiptInfo.to}`
                    )}
                    sx={{ fontStyle: 'normal' }}>
                    {getAddress(evmReceiptInfo.to)}
                  </Link>
                  <CopyButton
                  size="small"
                  textToCopy={evmReceiptInfo.to}/>
                  </>
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
                  <>
                  <Link
                    href={getNewPathByRollapp(
                      pathname,
                      `${Path.ADDRESS}/${evmReceiptInfo.contractAddress}`
                    )}
                    sx={{ fontStyle: 'normal' }}>
                    {getAddress(evmReceiptInfo.contractAddress)}
                  </Link>
                  <CopyButton
                  size="small"
                  textToCopy={evmReceiptInfo.contractAddress}/>
                  </>
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
