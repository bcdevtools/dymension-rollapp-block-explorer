'use client';

import { Transaction } from '@/consts/rpcResTypes';
import AccordionSummary from '@mui/material/AccordionSummary';
import Accordion from '@mui/material/Accordion';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccordionDetails from '@mui/material/AccordionDetails';
import { getMessageName, translateCts } from '@/utils/transaction';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import { getNewPathByRollapp } from '@/utils/common';
import { usePathname } from 'next/navigation';
import { Path } from '@/consts/path';
import Link from '@mui/material/Link';

function MessageItem({
  label,
  value,
}: Readonly<{ label: string; value: React.ReactNode | string }>) {
  return (
    <Grid container item>
      <Grid xs={12} lg={3}>
        <Typography color="grey">{label}</Typography>
      </Grid>
      <Grid xs={12} lg={9}>
        {typeof value === 'string' ? <Typography>{value}</Typography> : value}
      </Grid>
    </Grid>
  );
}

export default function Messages({
  transaction,
}: Readonly<{
  transaction: Transaction;
}>) {
  const pathname = usePathname();
  return transaction.msgs.map((msg, idx) => (
    <Accordion key={msg.idx}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <b>
          #{idx + 1} {getMessageName(msg.type)}
        </b>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={1}>
          <MessageItem label="Type" value={msg.type} />
          <MessageItem
            label="Content"
            value={
              <Typography sx={{ fontStyle: 'italic' }}>
                {translateCts(msg.content.ctm, address => (
                  <Link
                    href={getNewPathByRollapp(
                      pathname,
                      `${Path.ADDRESS}/${address}`
                    )}
                    underline="hover"
                    sx={{ fontStyle: 'normal' }}>
                    {address}
                  </Link>
                ))}
              </Typography>
            }
          />
          <MessageItem
            label="Proto Content"
            value={
              <TextField
                value={JSON.stringify(msg.protoContent, null, 4)}
                multiline
                // disabled
                sx={{ width: '100%', fontStyle: 'italic' }}
                size="small"
                maxRows={12}
              />
            }
          />
        </Grid>
      </AccordionDetails>
    </Accordion>
  ));
}
