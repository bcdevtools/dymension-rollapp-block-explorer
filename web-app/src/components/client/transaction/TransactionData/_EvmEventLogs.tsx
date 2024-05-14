import { Erc20ContractInfo, Transaction } from '@/consts/rpcResTypes';
import AccordionSummary from '@mui/material/AccordionSummary';
import Accordion from '@mui/material/Accordion';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccordionDetails from '@mui/material/AccordionDetails';
import Grid from '@mui/material/Grid';
import React from 'react';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import { ItemContainer, RowItem } from './_Common';
import {
  EventTopicType,
  TranslateType,
  translateEvmLogIfPossible,
} from '@/utils/transaction';
import { getAddress } from '@ethersproject/address';
import AddressLink from '@/components/client/address/AddressLink';

export default function EvmEventLogs({
  transaction,
}: Readonly<{
  transaction: Transaction;
}>) {
  return transaction.evmReceipt?.logs.map((event, idx) => {
    const contractNameOrAddress =
      transaction.evmContractAddressToErc20ContractInfo?.get(event.address)
        ?.name || getAddress(event.address);
    const logIndex = Number(event.logIndex);

    return (
      <Accordion key={idx} defaultExpanded={idx <= 10}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <b>
            [{logIndex}] {contractNameOrAddress} emits{' '}
            {getShortenedTopic(event.topics[0])}
          </b>
        </AccordionSummary>
        <AccordionDetails>
          <ItemContainer>
            <RowItem
              label="Contract"
              value={
                <AddressLink
                  address={getAddress(event.address)}
                  display={contractNameOrAddress}
                />
              }
            />
            {renderTopicsAndData(
              event.topics,
              event.data,
              event.address,
              transaction.evmContractAddressToErc20ContractInfo
            )}
            <RowItem label="Log Index" value={logIndex} />
          </ItemContainer>
        </AccordionDetails>
      </Accordion>
    );
  });
}

function getShortenedTopic(topic: string) {
  switch (topic) {
    case EventTopicType.TRANSFER:
      return 'Transfer';
    case EventTopicType.APPROVAL:
      return 'Approval';
    case EventTopicType.TRANSFER_SINGLE:
      return 'TransferSingle';
    case EventTopicType.TRANSFER_BATCH:
      return 'TransferBatch';
    default:
      return topic.substring(0, 10) + '...';
  }
}

function renderTopicsAndData(
  topics: string[],
  data: string,
  emitter: string,
  contractAddressToErc20ContractInfo: Map<string, Erc20ContractInfo> | undefined
) {
  const translated = translateEvmLogIfPossible(
    topics,
    data,
    emitter,
    contractAddressToErc20ContractInfo
  );
  if (!translated)
    return (
      <>
        {topics.map((topic, idx) => (
          <Grid key={idx} container item xs={12}>
            <Grid item xs={12} lg={3}>
              <Typography color="text.secondary">{`topic${idx}`}</Typography>
            </Grid>
            <Grid item xs={12} lg={9}>
              <Typography>{topic}</Typography>
            </Grid>
          </Grid>
        ))}
        <RowItem
          label="Data"
          value={
            <TextField
              value={data}
              multiline
              sx={{ width: '100%', fontStyle: 'italic' }}
              size="small"
              maxRows={12}
            />
          }
        />
      </>
    );

  switch (translated.type) {
    case TranslateType.ERC20_TRANSFER:
    case TranslateType.ERC20_APPROVAL:
      return (
        <>
          <RowItem label="Action" value={translated.action} />
          <RowItem
            label="From"
            value={<AddressLink address={getAddress(translated.from)} />}
          />
          <RowItem
            label="To"
            value={<AddressLink address={getAddress(translated.to)} />}
          />
          <RowItem
            label="Amount"
            value={
              translated.isRawAmount ? (
                <>(Raw) {translated.amount}</>
              ) : (
                <>
                  {translated.amount}{' '}
                  {contractAddressToErc20ContractInfo?.get(emitter)?.symbol ||
                    ''}
                </>
              )
            }
          />
        </>
      );
  }
}
