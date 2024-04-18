import { Transaction } from '@/consts/rpcResTypes';
import AccordionSummary from '@mui/material/AccordionSummary';
import Accordion from '@mui/material/Accordion';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccordionDetails from '@mui/material/AccordionDetails';
import Grid from '@mui/material/Grid';
import React from 'react';
import Typography from '@mui/material/Typography';

export default function EventLogs({
  transaction,
}: Readonly<{
  transaction: Transaction;
}>) {
  return transaction.result.events.map((event, idx) => (
    <Accordion key={idx}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <b>{event.type}</b>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={1}>
          {event.attributes.map((attr, idx) => (
            <Grid key={idx} container item xs={12}>
              <Grid item xs={12} lg={3}>
                <Typography color="grey">{attr.key}</Typography>
              </Grid>
              <Grid item xs={12} lg={9}>
                <Typography>{attr.value}</Typography>
              </Grid>
            </Grid>
          ))}
        </Grid>
      </AccordionDetails>
    </Accordion>
  ));
}