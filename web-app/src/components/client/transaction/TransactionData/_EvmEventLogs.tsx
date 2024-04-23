import { Transaction } from '@/consts/rpcResTypes';
import AccordionSummary from '@mui/material/AccordionSummary';
import Accordion from '@mui/material/Accordion';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccordionDetails from '@mui/material/AccordionDetails';
import Grid from '@mui/material/Grid';
import React from 'react';
import Typography from '@mui/material/Typography';
import { TextField } from '@mui/material';
import { RowItem } from './_Common';
import { usePathname } from 'next/navigation';
import { getNewPathByRollapp } from '@/utils/common';
import { Path } from '@/consts/path';
import Link from '@mui/material/Link';

export default function EvmEventLogs({
  transaction,
}: Readonly<{
  transaction: Transaction;
}>) {
  const pathname = usePathname();
  return transaction.evmReceipt?.logs.map((event, idx) => (
    <Accordion key={idx}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <b>{event.address} emits {getShortenedTopic(event.topics[0])}</b>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={1}>
          <RowItem label="Contract" value={<Link
                href={getNewPathByRollapp(
                    pathname,
                    `${Path.ADDRESS}/${event.address}`
                )}
                underline="hover"
                sx={{ fontStyle: 'normal' }}>
                {event.address}
                </Link>} />
          {event.topics.map((topic, idx) => (
            <Grid key={idx} container item xs={12}>
              <Grid item xs={12} lg={3}>
                <Typography color="grey">{`topic${idx}`}</Typography>
              </Grid>
              <Grid item xs={12} lg={9}>
                <Typography>{topic}</Typography>
              </Grid>
            </Grid>
          ))}
          <RowItem label="Data" value={<TextField
            value={event.data}
            multiline
            sx={{ width: '100%', fontStyle: 'italic' }}
            size="small"
            maxRows={12}
          />} />
          <RowItem label="Log Index" value={Number(event.logIndex)} />
        </Grid>
      </AccordionDetails>
    </Accordion>
  ));
}

function getShortenedTopic(topic: string) {
  switch(topic) {
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