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
import { usePathname } from 'next/navigation';
import { getNewPathByRollapp } from '@/utils/common';
import { Path } from '@/consts/path';
import { translateEvmLogIfPossible } from '@/utils/transaction';
import { getAddress } from '@ethersproject/address';
import Link from '@/components/commons/Link';

export default function EvmEventLogs({
  transaction,
}: Readonly<{
  transaction: Transaction;
}>) {
  const pathname = usePathname();
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
                <Link
                  href={getNewPathByRollapp(
                    pathname,
                    `${Path.ADDRESS}/${event.address}`
                  )}
                  sx={{ fontStyle: 'normal' }}>
                  {contractNameOrAddress}
                </Link>
              }
            />
            {renderTopicsAndData(
              event.topics,
              event.data,
              event.address,
              transaction.evmContractAddressToErc20ContractInfo,
              pathname
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
    case '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef':
      return 'Transfer';
    case '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925':
      return 'Approval';
    case '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62':
      return 'TransferSingle';
    case '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb':
      return 'TransferBatch';
    default:
      return topic.substring(0, 10) + '...';
  }
}

function renderTopicsAndData(
  topics: string[],
  data: string,
  emitter: string,
  contractAddressToErc20ContractInfo:
    | Map<string, Erc20ContractInfo>
    | undefined,
  pathname: string
) {
  const translatedOrNull = translateEvmLogIfPossible(
    topics,
    data,
    emitter,
    contractAddressToErc20ContractInfo
  );
  if (translatedOrNull && translatedOrNull?.type == 'Erc20TransferEvent') {
    return (
      <>
        <RowItem label="Action" value="Transfer (ERC-20)" />
        <RowItem
          label="From"
          value={
            <Link
              href={getNewPathByRollapp(
                pathname,
                `${Path.ADDRESS}/${translatedOrNull.from}`
              )}
              sx={{ fontStyle: 'normal' }}>
              {translatedOrNull.from}
            </Link>
          }
        />
        <RowItem
          label="To"
          value={
            <Link
              href={getNewPathByRollapp(
                pathname,
                `${Path.ADDRESS}/${translatedOrNull.to}`
              )}
              sx={{ fontStyle: 'normal' }}>
              {translatedOrNull.to}
            </Link>
          }
        />
        <RowItem
          label="Amount"
          value={
            translatedOrNull.rawAmount ? (
              <>(Raw) {translatedOrNull.amount}</>
            ) : (
              <>
                {translatedOrNull.amount}{' '}
                {contractAddressToErc20ContractInfo?.get(emitter)?.symbol || ''}
              </>
            )
          }
        />
      </>
    );
  }

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
}
