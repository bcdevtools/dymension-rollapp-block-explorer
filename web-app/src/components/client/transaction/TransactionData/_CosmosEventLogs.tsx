import { Transaction } from '@/consts/rpcResTypes';
import AccordionSummary from '@mui/material/AccordionSummary';
import Accordion from '@mui/material/Accordion';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccordionDetails from '@mui/material/AccordionDetails';
import Grid from '@mui/material/Grid';
import React from 'react';
import Typography from '@mui/material/Typography';
import useDenomsMetadata from '@/hooks/useDenomsMetadata';
import { formatRpcAmount } from '@/utils/common';

export default function CosmosEventLogs({
  transaction,
}: Readonly<{
  transaction: Transaction;
}>) {
  const [denomsMetadata] = useDenomsMetadata();
  return transaction.result.events.map((event, idx) => (
    <Accordion key={idx} defaultExpanded={idx < 10}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <b>{event.type}</b>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={1}>
          {event.attributes.map((attr, idx) => {
            const isAmount = attr.key === 'amount' || attr.key === 'fee';
            const value = isAmount
                ? formatRpcAmount(attr.value, denomsMetadata)
                : attr.value;
            return (
              <Grid key={idx} container item xs={12}>
                <Grid item xs={12} lg={3}>
                  <Typography color="text.secondary">{attr.key}</Typography>
                </Grid>
                <Grid item xs={12} lg={9}>
                  <Typography>{value}</Typography>
                  {isAmount && (
                    <Typography
                      fontStyle="italic"
                      fontSize="0.7rem"
                      color="text.secondary">
                      {attr.value}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            );
          })}
        </Grid>
      </AccordionDetails>
    </Accordion>
  ));
}
