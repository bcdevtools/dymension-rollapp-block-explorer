'use client';

import { Transaction, EvmTx, EvmReceipt } from '@/consts/rpcResTypes';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { getNewPathByRollapp } from '@/utils/common';
import { usePathname } from 'next/navigation';
import { Path } from '@/consts/path';
import Link from '@mui/material/Link';
import { divideAmountByDecimals } from '@/utils/number';

function RowItem({
  label,
  value,
}: Readonly<{ label: string; value: React.ReactNode | string }>) {
  return (
    <Grid container item>
      <Grid item xs={12} lg={3}>
        <Typography color="grey">{label}</Typography>
      </Grid>
      <Grid item xs={12} lg={9}>
        {typeof value === 'string' ? <Typography>{value}</Typography> : value}
      </Grid>
    </Grid>
  );
}

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

function fromHexStringToEthereumValue(hexStr: string) {
    return divideAmountByDecimals(`${Number(hexStr)}`, 18).toString()
}

function fromHexStringToEthereumGasPriceValue(hexStr: string) {
    return divideAmountByDecimals(`${Number(hexStr)}`, 9).toString()
}