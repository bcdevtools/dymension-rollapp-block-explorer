'use client';

import { Transaction } from '@/consts/rpcResTypes';
import { ItemContainer, RowItem } from './_Common';
import { fromHexStringToEthereumGasPriceValue } from '@/utils/transaction';
import { formatNumber, hexToDec } from '@/utils/number';
import { getAddress } from '@ethersproject/address';
import AddressLink from '@/components/client/address/AddressLink';

export default function EvmReceiptDetails({
  transaction,
}: Readonly<{
  transaction: Transaction;
}>) {
  const evmReceiptInfo = transaction.evmReceipt;

  return (
    evmReceiptInfo && (
      <ItemContainer>
        <RowItem
          label="From"
          value={<AddressLink address={getAddress(evmReceiptInfo.from)} />}
        />
        {evmReceiptInfo.to && (
          <RowItem
            label="To"
            value={<AddressLink address={getAddress(evmReceiptInfo.to)} />}
          />
        )}
        {evmReceiptInfo.contractAddress && (
          <RowItem
            label="New Contract Address"
            value={
              <AddressLink
                address={getAddress(evmReceiptInfo.contractAddress)}
              />
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
