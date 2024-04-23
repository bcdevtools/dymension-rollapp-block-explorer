'use client';

import { Transaction, EvmTx, EvmReceipt, TxMode, Erc20ContractInfo, EvmLog } from '@/consts/rpcResTypes';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import { getNewPathByRollapp } from '@/utils/common';
import { usePathname } from 'next/navigation';
import { Path } from '@/consts/path';
import Link from '@mui/material/Link';
import { RowItem, fromHexStringToEthereumGasPriceValue, fromHexStringToEthereumValue, translateEvmLogIfPossible } from './_Common';

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

  if (transaction.mode === TxMode.EVM_GENERAL_TRANSFER) {
    return EvmDetailsGeneralTransfer(evmTxInfo, pathname, transaction.evmContractAddressToErc20ContractInfo);
  } else if (transaction.mode === TxMode.EVM_CONTRACT_CALL) {
    return EvmDetailsContractCall(evmTxInfo, evmTxReceipt, pathname, transaction.evmContractAddressToErc20ContractInfo)
  } else if (transaction.mode === TxMode.EVM_CONTRACT_DEPLOY) {
    return EvmDetailsDeployContract(evmTxInfo, evmTxReceipt, pathname, transaction.evmContractAddressToErc20ContractInfo);
  } else {
    return <>Unknown EVM Tx mode {transaction.mode}</>
  }
}

function EvmDetailsDeployContract(evmTx: EvmTx, evmTxReceipt: EvmReceipt, pathname: string, contractAddressToErc20ContractInfo?: Map<string, Erc20ContractInfo>) {
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
                            {contractAddressToErc20ContractInfo?.get(evmTxReceipt.contractAddress)?.name || evmTxReceipt.contractAddress}
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

function EvmDetailsGeneralTransfer(evmTx: EvmTx, pathname: string, contractAddressToErc20ContractInfo?: Map<string, Erc20ContractInfo>) {
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

function EvmDetailsContractCall(evmTx: EvmTx, evmTxReceipt: EvmReceipt, pathname: string, contractAddressToErc20ContractInfo?: Map<string, Erc20ContractInfo>) {
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
                        {contractAddressToErc20ContractInfo?.get(evmTx.to!)?.name || evmTx.to}
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
            {
                evmTxReceipt.logs.length > 0 &&
                renderEvmTxActions(evmTxReceipt.logs, contractAddressToErc20ContractInfo, pathname)
            }
        </>
    );
}

function renderEvmTxActions(evmTxLogs: EvmLog[], contractAddressToErc20ContractInfo: Map<string, Erc20ContractInfo> | undefined, pathname: string) {
    return evmTxLogs.map((log, idx) => {
        return renderEvmTxAction(log.topics, log.data, log.address, contractAddressToErc20ContractInfo, pathname);
    })
}

function renderEvmTxAction(topics: string[], data: string, emitter: string, contractAddressToErc20ContractInfo: Map<string, Erc20ContractInfo> | undefined, pathname: string) {
  const translatedOrNull = translateEvmLogIfPossible(topics, data, emitter, contractAddressToErc20ContractInfo);
  if (translatedOrNull && translatedOrNull?.type == 'Erc20TransferEvent') {
    return <RowItem label="Action" value={
        <>Transfer {translatedOrNull.rawAmount && `(Raw) `} {translatedOrNull.amount} {contractAddressToErc20ContractInfo?.get(emitter)?.symbol || ''} from <Link
        href={getNewPathByRollapp(
            pathname,
            `${Path.ADDRESS}/${translatedOrNull.from}`
        )}
        underline="hover"
        sx={{ fontStyle: 'normal' }}>
        {translatedOrNull.from}
    </Link> to <Link
        href={getNewPathByRollapp(
            pathname,
            `${Path.ADDRESS}/${translatedOrNull.to}`
        )}
        underline="hover"
        sx={{ fontStyle: 'normal' }}>
        {translatedOrNull.to}
    </Link>
        </>
    } />
  } else {
    return <></>
  }
}