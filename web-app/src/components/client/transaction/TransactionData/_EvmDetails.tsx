'use client';

import {
  Transaction,
  EvmTx,
  EvmReceipt,
  TxMode,
  Erc20ContractInfo,
  EvmLog,
} from '@/consts/rpcResTypes';
import TextField from '@mui/material/TextField';
import { ItemContainer, RowItem } from './_Common';
import {
  TranslateType,
  fromHexStringToEthereumGasPriceValue,
  fromHexStringToEthereumValue,
  translateEvmLogIfPossible,
} from '@/utils/transaction';
import { getAddress } from '@ethersproject/address';
import { formatNumber } from '@/utils/number';
import AddressLink from '@/components/client/address/AddressLink';
import useChainInfo from '@/hooks/useChainInfo';
import useDenomsMetadata from '@/hooks/useDenomsMetadata';
import Skeleton from '@mui/material/Skeleton';

export default function EvmDetails({
  transaction,
}: Readonly<{
  transaction: Transaction;
}>) {
  const evmTxInfo = transaction.evmTx;
  if (!evmTxInfo) {
    return 'Error: no EVM tx details to show';
  }

  const evmTxReceipt = transaction.evmReceipt;
  if (!evmTxReceipt) {
    return 'Error: no EVM receipt details';
  }

  if (transaction.mode === TxMode.EVM_GENERAL_TRANSFER) {
    return <EvmDetailsGeneralTransfer evmTx={evmTxInfo} />;
  } else if (transaction.mode === TxMode.EVM_CONTRACT_CALL) {
    return EvmDetailsContractCall(
      evmTxInfo,
      evmTxReceipt,
      transaction.evmContractAddressToErc20ContractInfo
    );
  } else if (transaction.mode === TxMode.EVM_CONTRACT_DEPLOY) {
    return EvmDetailsDeployContract(
      evmTxInfo,
      evmTxReceipt,
      transaction.evmContractAddressToErc20ContractInfo
    );
  } else {
    return `Unknown EVM Tx mode ${transaction.mode}`;
  }
}

function EvmDetailsDeployContract(
  evmTx: EvmTx,
  evmTxReceipt: EvmReceipt,
  contractAddressToErc20ContractInfo?: Map<string, Erc20ContractInfo>
) {
  return (
    <ItemContainer>
      <RowItem
        label="Deployer"
        value={<AddressLink address={getAddress(evmTx.from)} />}
      />
      {evmTxReceipt.contractAddress ? (
        <RowItem
          label="Deploy New Contract"
          value={
            <AddressLink
              address={getAddress(evmTxReceipt.contractAddress)}
              display={
                contractAddressToErc20ContractInfo?.get(
                  evmTxReceipt.contractAddress
                )?.name
              }
            />
          }
        />
      ) : (
        <RowItem label="Deploy New Contract" value="Missing contract address" />
      )}
      {evmTx.input && (
        <RowItem
          label="Deployment Bytecode"
          value={
            <TextField
              value={evmTx.input}
              multiline
              sx={{ width: '100%', fontStyle: 'italic' }}
              size="small"
              maxRows={12}
            />
          }
        />
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

function EvmDetailsGeneralTransfer({ evmTx }: { evmTx: EvmTx }) {
  const [chainInfo, chainInfoLoading] = useChainInfo();
  const [denomsMetadata, denomsMetadataLoading] = useDenomsMetadata();

  const loading = chainInfoLoading || denomsMetadataLoading;

  const denom = !chainInfoLoading ? chainInfo!.denoms.evm : null;

  return (
    <ItemContainer>
      <RowItem
        label="Transfer"
        value={
          loading ? (
            <Skeleton />
          ) : (
            `${fromHexStringToEthereumValue(evmTx.value!)} ${
              denom && denomsMetadata[denom] ? denomsMetadata[denom].symbol : ''
            }`
          )
        }
      />
      <RowItem
        label="From"
        value={
          loading ? (
            <Skeleton />
          ) : (
            <AddressLink address={getAddress(evmTx.from)} />
          )
        }
      />
      <RowItem
        label="To"
        value={
          loading ? (
            <Skeleton />
          ) : (
            evmTx.to && <AddressLink address={getAddress(evmTx.to)} />
          )
        }
      />
      <RowItem
        label="Gas Price"
        value={
          loading ? (
            <Skeleton />
          ) : (
            formatNumber(fromHexStringToEthereumGasPriceValue(evmTx.gasPrice))
          )
        }
      />
    </ItemContainer>
  );
}

function EvmDetailsContractCall(
  evmTx: EvmTx,
  evmTxReceipt: EvmReceipt,
  contractAddressToErc20ContractInfo?: Map<string, Erc20ContractInfo>
) {
  return (
    <ItemContainer>
      {evmTxReceipt.logs.length > 0 &&
        renderEvmTxActions(
          evmTxReceipt.logs,
          contractAddressToErc20ContractInfo
        )}
      <RowItem
        label="Caller"
        value={<AddressLink address={getAddress(evmTx.from)} />}
      />
      <RowItem
        label="Contract"
        value={evmTx.to && <AddressLink address={getAddress(evmTx.to)} />}
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
    </ItemContainer>
  );
}

function renderEvmTxActions(
  evmTxLogs: EvmLog[],
  contractAddressToErc20ContractInfo: Map<string, Erc20ContractInfo> | undefined
) {
  let renderedAny = false;
  return (
    <>
      {evmTxLogs.map((log, idx) => {
        const renderElement = renderEvmTxAction(
          log.topics,
          log.data,
          log.address,
          contractAddressToErc20ContractInfo,
          idx
        );
        renderedAny = renderedAny || !!renderElement;
        return renderElement;
      })}
      {renderedAny && (
        <>
          <br />
          <br />
          <br />
        </>
      )}
    </>
  );
}

function renderEvmTxAction(
  topics: string[],
  data: string,
  emitter: string,
  contractAddressToErc20ContractInfo:
    | Map<string, Erc20ContractInfo>
    | undefined,
  key: number
) {
  const translated = translateEvmLogIfPossible(
    topics,
    data,
    emitter,
    contractAddressToErc20ContractInfo
  );
  if (!translated) return null;

  switch (translated.type) {
    case TranslateType.ERC20_TRANSFER:
      return (
        <RowItem
          key={key}
          label="Action"
          value={
            <>
              Transfer {translated.isRawAmount && `(Raw) `} {translated.amount}{' '}
              {contractAddressToErc20ContractInfo?.get(emitter)?.symbol || ''}{' '}
              from{' '}
              <AddressLink
                address={translated.from}
                display={getAddress(translated.from)}
              />{' '}
              to{' '}
              <AddressLink
                address={translated.to}
                display={getAddress(translated.to)}
              />
            </>
          }
        />
      );
    case TranslateType.ERC20_APPROVAL:
      return (
        <RowItem
          key={key}
          label="Action"
          value={
            <>
              Granted spend up to {translated.isRawAmount && `(Raw) `} {translated.amount}{' '}
              {contractAddressToErc20ContractInfo?.get(emitter)?.symbol || ''}{' '}
              from{' '}
              <AddressLink
                address={translated.from}
                display={getAddress(translated.from)}
              />{', '}
              grant to{' '}
              <AddressLink
                address={translated.to}
                display={getAddress(translated.to)}
              />
            </>
          }
        />
      );
  }
}
