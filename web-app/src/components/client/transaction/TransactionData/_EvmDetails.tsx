'use client';

import { Transaction, EvmTx, EvmReceipt } from '@/consts/rpcResTypes';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import { getNewPathByRollapp } from '@/utils/common';
import { usePathname } from 'next/navigation';
import { Path } from '@/consts/path';
import Link from '@mui/material/Link';
import { RowItem, fromHexStringToEthereumGasPriceValue, fromHexStringToEthereumValue } from './_Common';

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

  const evmTxReceipt = transaction?.evmReceipt;
  if (!evmTxReceipt) {
    return <>Error: no EVM receipt details</>;
  }

  const hasInput = evmTxInfo.input && evmTxInfo.input.length >= 10;
  const hasEvmLogs = evmTxReceipt.logs && evmTxReceipt.logs.length > 0;

  if (evmTxInfo.to && evmTxInfo.value && !hasInput && !hasEvmLogs) {
    return EvmDetailsGeneralTransfer(evmTxInfo, pathname);
  }

  if (evmTxInfo.to) {
    return EvmDetailsContractCall(evmTxInfo, pathname)
  } else {
    return EvmDetailsDeployContract(evmTxInfo, evmTxReceipt, pathname);
  }
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
            <RowItem label="Input" value={
                evmTx.input && evmTx.input != '0x'
                ? <TextField
                    value={evmTx.input}
                    multiline
                    // disabled
                    sx={{ width: '100%', fontStyle: 'italic' }}
                    size="small"
                    maxRows={12}
                />
                : <i>none</i>
            } />
            <RowItem label="Tx Value" value={fromHexStringToEthereumValue(evmTx.value!)} />
            <RowItem label="Gas" value={Number(evmTx.gas)} />
            <RowItem label="Gas Price" value={fromHexStringToEthereumGasPriceValue(evmTx.gasPrice)} />
        </>
    );
}
