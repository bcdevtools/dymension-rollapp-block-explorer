'use client';

import { Transaction, EvmTx, EvmReceipt } from '@/consts/rpcResTypes';
import AccordionSummary from '@mui/material/AccordionSummary';
import Accordion from '@mui/material/Accordion';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccordionDetails from '@mui/material/AccordionDetails';
import { getMessageName, translateCts } from '@/utils/transaction';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import { getNewPathByRollapp } from '@/utils/common';
import { usePathname } from 'next/navigation';
import { Path } from '@/consts/path';
import Link from '@mui/material/Link';
import { divideAmountByDecimals } from '@/utils/number';
import Big from 'big.js';

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

export default function EvmDetails({
  transaction,
}: Readonly<{
  transaction: Transaction;
}>) {
  const pathname = usePathname();
  const evmTxInfo = transaction?.evmTx;
  if (!evmTxInfo) {
    return <>Error: no EVM tx details to show</>;
  }

  const hasInput = evmTxInfo.input && evmTxInfo.input.length >= 10;

  if (evmTxInfo.to && evmTxInfo.value && !hasInput) {
    return EvmDetailsGeneralTransfer(evmTxInfo, pathname);
  }

  const evmTxReceipt = transaction?.evmReceipt;
  if (!evmTxReceipt) {
    return <>Error: no EVM receipt details</>;
  }

  if (!evmTxInfo.to) {
    return EvmDetailsDeployContract(evmTxInfo, evmTxReceipt, pathname);
  }

  if (evmTxInfo.to && hasInput) {
    return EvmDetailsContractCall(evmTxInfo, pathname)
  }

  return (
    <>Error: Failed to detect transaction type to render details</>
  );
}

function EvmDetailsDeployContract(evmTx: EvmTx, evmTxReceipt: EvmReceipt, pathname: string) {
    return (
        <>
            <RowItem label="Deployer" 
                value={
                    <Typography sx={{ fontStyle: 'italic' }}>
                        {<Link
                        href={getNewPathByRollapp(
                            pathname,
                            `${Path.ADDRESS}/${evmTx.from}`
                        )}
                        underline="hover"
                        sx={{ fontStyle: 'normal' }}>
                        {evmTx.from}
                        </Link>}
                    </Typography>
                }
            />
            {
                evmTxReceipt.contractAddress
                ? <RowItem label="Deploy New Contract" 
                    value={
                        <Typography sx={{ fontStyle: 'italic' }}>
                            {<Link
                            href={getNewPathByRollapp(
                                pathname,
                                `${Path.ADDRESS}/${evmTxReceipt.contractAddress}`
                            )}
                            underline="hover"
                            sx={{ fontStyle: 'normal' }}>
                            {evmTxReceipt.contractAddress}
                            </Link>}
                        </Typography>
                    }
                />
                : <RowItem label="Deploy New Contract" value="Missing contract address" />
            }
            <RowItem label="Gas" value={Number(evmTx.gas)} />
            <RowItem label="Gas Price" value={fromHexStringToEthereumGasPriceValue(evmTx.gasPrice)} />
        </>
    );
}

function EvmDetailsGeneralTransfer(evmTx: EvmTx, pathname: string) {
    return (
        <>
            <RowItem label="Transfer" value={fromHexStringToEthereumValue(evmTx.value!)} />
            <RowItem label="From" 
                value={
                    <Typography sx={{ fontStyle: 'italic' }}>
                        {<Link
                        href={getNewPathByRollapp(
                            pathname,
                            `${Path.ADDRESS}/${evmTx.from}`
                        )}
                        underline="hover"
                        sx={{ fontStyle: 'normal' }}>
                        {evmTx.from}
                        </Link>}
                    </Typography>
                }
            />
            <RowItem label="To" 
                value={
                    <Typography sx={{ fontStyle: 'italic' }}>
                        {<Link
                        href={getNewPathByRollapp(
                            pathname,
                            `${Path.ADDRESS}/${evmTx.to}`
                        )}
                        underline="hover"
                        sx={{ fontStyle: 'normal' }}>
                        {evmTx.to}
                        </Link>}
                    </Typography>
                }
            />
            <RowItem label="Gas" value={Number(evmTx.gas)} />
            <RowItem label="Gas Price" value={fromHexStringToEthereumGasPriceValue(evmTx.gasPrice)} />
        </>
    );
}

function EvmDetailsContractCall(evmTx: EvmTx, pathname: string) {
    return (
        <>
            <RowItem label="Caller" 
                value={
                    <Typography sx={{ fontStyle: 'italic' }}>
                        {<Link
                        href={getNewPathByRollapp(
                            pathname,
                            `${Path.ADDRESS}/${evmTx.from}`
                        )}
                        underline="hover"
                        sx={{ fontStyle: 'normal' }}>
                        {evmTx.from}
                        </Link>}
                    </Typography>
                }
            />
            <RowItem label="Contract" 
                value={
                    <Typography sx={{ fontStyle: 'italic' }}>
                        {<Link
                        href={getNewPathByRollapp(
                            pathname,
                            `${Path.ADDRESS}/${evmTx.to}`
                        )}
                        underline="hover"
                        sx={{ fontStyle: 'normal' }}>
                        {evmTx.to}
                        </Link>}
                    </Typography>
                }
            />
            <RowItem label="Method" value={evmTx.input!.substring(0, 10)} />
            <RowItem label="Input" value={<TextField
                value={evmTx.input}
                multiline
                // disabled
                sx={{ width: '100%', fontStyle: 'italic' }}
                size="small"
                maxRows={12}
              />} />
            <RowItem label="Tx Value" value={fromHexStringToEthereumValue(evmTx.value!)} />
            <RowItem label="Gas" value={Number(evmTx.gas)} />
            <RowItem label="Gas Price" value={fromHexStringToEthereumGasPriceValue(evmTx.gasPrice)} />
        </>
    );
}

function fromHexStringToEthereumValue(hexStr: string) {
    return divideAmountByDecimals(`${Number(hexStr)}`, 18).toString()
}

function fromHexStringToEthereumGasPriceValue(hexStr: string) {
    return divideAmountByDecimals(`${Number(hexStr)}`, 9).toString()
}