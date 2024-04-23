import { Transaction } from '@/consts/rpcResTypes';
import AccordionSummary from '@mui/material/AccordionSummary';
import Accordion from '@mui/material/Accordion';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccordionDetails from '@mui/material/AccordionDetails';
import Grid from '@mui/material/Grid';
import React from 'react';
import Typography from '@mui/material/Typography';
import { TextField } from '@mui/material';

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

export default function EvmEventLogs({
  transaction,
}: Readonly<{
  transaction: Transaction;
}>) {
  return transaction.evmReceipt?.logs.map((event, idx) => (
    <Accordion key={idx}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <b>{event.address} &gt; {event.topics[0]}</b>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={1}>
          <RowItem label="Address" value={event.address} />
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
