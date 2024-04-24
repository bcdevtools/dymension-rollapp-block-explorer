'use client';

import {
  Transaction,
  EvmTx,
  EvmReceipt,
  TxMode,
  Erc20ContractInfo,
  EvmLog,
} from '@/consts/rpcResTypes';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import { getNewPathByRollapp } from '@/utils/common';
import { usePathname } from 'next/navigation';
import { Path } from '@/consts/path';
import { ItemContainer, RowItem } from './_Common';
import {
  fromHexStringToEthereumGasPriceValue,
  fromHexStringToEthereumValue,
  translateEvmLogIfPossible,
} from '@/utils/transaction';
import { getAddress } from '@ethersproject/address';
import { formatNumber } from '@/utils/number';
import Link from '@/components/commons/Link';

export default function EvmDetails({
  transaction,
}: Readonly<{
  transaction: Transaction;
}>) {
  const pathname = usePathname();
  const evmTxInfo = transaction.evmTx;
  if (!evmTxInfo) {
    return 'Error: no EVM tx details to show';
  }

  const evmTxReceipt = transaction.evmReceipt;
  if (!evmTxReceipt) {
    return 'Error: no EVM receipt details';
  }

  if (transaction.mode === TxMode.EVM_GENERAL_TRANSFER) {
    return EvmDetailsGeneralTransfer(evmTxInfo, pathname);
  } else if (transaction.mode === TxMode.EVM_CONTRACT_CALL) {
    return EvmDetailsContractCall(
      evmTxInfo,
      evmTxReceipt,
      pathname,
      transaction.evmContractAddressToErc20ContractInfo
    );
  } else if (transaction.mode === TxMode.EVM_CONTRACT_DEPLOY) {
    return EvmDetailsDeployContract(
      evmTxInfo,
      evmTxReceipt,
      pathname,
      transaction.evmContractAddressToErc20ContractInfo
    );
  } else {
    return `Unknown EVM Tx mode ${transaction.mode}`;
  }
}

function EvmDetailsDeployContract(
  evmTx: EvmTx,
  evmTxReceipt: EvmReceipt,
  pathname: string,
  contractAddressToErc20ContractInfo?: Map<string, Erc20ContractInfo>
) {
  return (
    <ItemContainer>
      <RowItem
        label="Deployer"
        value={
          <Typography sx={{ fontStyle: 'italic' }}>
            {
              <Link
                href={getNewPathByRollapp(
                  pathname,
                  `${Path.ADDRESS}/${evmTx.from}`
                )}
                sx={{ fontStyle: 'normal' }}>
                {getAddress(evmTx.from)}
              </Link>
            }
          </Typography>
        }
      />
      {evmTxReceipt.contractAddress ? (
        <RowItem
          label="Deploy New Contract"
          value={
            <Typography sx={{ fontStyle: 'italic' }}>
              {
                <Link
                  href={getNewPathByRollapp(
                    pathname,
                    `${Path.ADDRESS}/${evmTxReceipt.contractAddress}`
                  )}
                  sx={{ fontStyle: 'normal' }}>
                  {contractAddressToErc20ContractInfo?.get(
                    evmTxReceipt.contractAddress
                  )?.name || getAddress(evmTxReceipt.contractAddress)}
                </Link>
              }
            </Typography>
          }
        />
      ) : (
        <RowItem label="Deploy New Contract" value="Missing contract address" />
      )}
      <RowItem
        label="Gas Price"
        value={formatNumber(
          fromHexStringToEthereumGasPriceValue(evmTx.gasPrice)
        )}
      />
    </ItemContainer>
  );
}

function EvmDetailsGeneralTransfer(evmTx: EvmTx, pathname: string) {
  return (
    <ItemContainer>
      <RowItem
        label="Transfer"
        value={fromHexStringToEthereumValue(evmTx.value!)}
      />
      <RowItem
        label="From"
        value={
          <Typography sx={{ fontStyle: 'italic' }}>
            {
              <Link
                href={getNewPathByRollapp(
                  pathname,
                  `${Path.ADDRESS}/${evmTx.from}`
                )}
                sx={{ fontStyle: 'normal' }}>
                {evmTx.from}
              </Link>
            }
          </Typography>
        }
      />
      <RowItem
        label="To"
        value={
          <Typography sx={{ fontStyle: 'italic' }}>
            {
              <Link
                href={getNewPathByRollapp(
                  pathname,
                  `${Path.ADDRESS}/${evmTx.to}`
                )}
                sx={{ fontStyle: 'normal' }}>
                {evmTx.to}
              </Link>
            }
          </Typography>
        }
      />
      <RowItem
        label="Gas Price"
        value={formatNumber(
          fromHexStringToEthereumGasPriceValue(evmTx.gasPrice)
        )}
      />
    </ItemContainer>
  );
}

function EvmDetailsContractCall(
  evmTx: EvmTx,
  evmTxReceipt: EvmReceipt,
  pathname: string,
  contractAddressToErc20ContractInfo?: Map<string, Erc20ContractInfo>
) {
  return (
    <ItemContainer>
      <RowItem
        label="Caller"
        value={
          <Typography sx={{ fontStyle: 'italic' }}>
            {
              <Link
                href={getNewPathByRollapp(
                  pathname,
                  `${Path.ADDRESS}/${evmTx.from}`
                )}
                sx={{ fontStyle: 'normal' }}>
                {getAddress(evmTx.from)}
              </Link>
            }
          </Typography>
        }
      />
      <RowItem
        label="Contract"
        value={
          <Typography sx={{ fontStyle: 'italic' }}>
            {
              <Link
                href={getNewPathByRollapp(
                  pathname,
                  `${Path.ADDRESS}/${evmTx.to}`
                )}
                sx={{ fontStyle: 'normal' }}>
                {contractAddressToErc20ContractInfo?.get(evmTx.to!)?.name ||
                  getAddress(evmTx.to!)}
              </Link>
            }
          </Typography>
        }
      />
      <RowItem label="Method" value={evmTx.input!.substring(0, 10)} />
      <RowItem
        label="Input"
        value={
          evmTx.input && evmTx.input != '0x' ? (
            <TextField
              value={evmTx.input}
              multiline
              // disabled
              sx={{ width: '100%', fontStyle: 'italic' }}
              size="small"
              maxRows={12}
            />
          ) : (
            <i>none</i>
          )
        }
      />
      <RowItem
        label="Tx Value"
        value={formatNumber(fromHexStringToEthereumValue(evmTx.value!))}
      />
      <RowItem
        label="Gas Price"
        value={formatNumber(
          fromHexStringToEthereumGasPriceValue(evmTx.gasPrice)
        )}
      />
      {evmTxReceipt.logs.length > 0 &&
        renderEvmTxActions(
          evmTxReceipt.logs,
          contractAddressToErc20ContractInfo,
          pathname
        )}
    </ItemContainer>
  );
}

function renderEvmTxActions(
  evmTxLogs: EvmLog[],
  contractAddressToErc20ContractInfo:
    | Map<string, Erc20ContractInfo>
    | undefined,
  pathname: string
) {
  return evmTxLogs.map((log, idx) => {
    return renderEvmTxAction(
      log.topics,
      log.data,
      log.address,
      contractAddressToErc20ContractInfo,
      pathname,
      idx
    );
  });
}

function renderEvmTxAction(
  topics: string[],
  data: string,
  emitter: string,
  contractAddressToErc20ContractInfo:
    | Map<string, Erc20ContractInfo>
    | undefined,
  pathname: string,
  key: number
) {
  const translatedOrNull = translateEvmLogIfPossible(
    topics,
    data,
    emitter,
    contractAddressToErc20ContractInfo
  );
  if (translatedOrNull && translatedOrNull?.type == 'Erc20TransferEvent') {
    return (
      <RowItem
        key={key}
        label="Action"
        value={
          <>
            Transfer {translatedOrNull.rawAmount && `(Raw) `}{' '}
            {translatedOrNull.amount}{' '}
            {contractAddressToErc20ContractInfo?.get(emitter)?.symbol || ''}{' '}
            from{' '}
            <Link
              href={getNewPathByRollapp(
                pathname,
                `${Path.ADDRESS}/${translatedOrNull.from}`
              )}
              sx={{ fontStyle: 'normal' }}>
              {getAddress(translatedOrNull.from)}
            </Link>{' '}
            to{' '}
            <Link
              href={getNewPathByRollapp(
                pathname,
                `${Path.ADDRESS}/${translatedOrNull.to}`
              )}
              sx={{ fontStyle: 'normal' }}>
              {getAddress(translatedOrNull.to)}
            </Link>
          </>
        }
      />
    );
  } else {
    return null;
  }
}
