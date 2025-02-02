'use client';

import { Transaction } from '@/consts/rpcResTypes';
import AccordionSummary from '@mui/material/AccordionSummary';
import Accordion from '@mui/material/Accordion';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccordionDetails from '@mui/material/AccordionDetails';
import { getMessageName, translateCts } from '@/utils/transaction';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import { ItemContainer, RowItem } from './_Common';
import AddressLink from '../../address/AddressLink';

export default function Messages({
  transaction,
}: Readonly<{
  transaction: Transaction;
}>) {
  return transaction.msgs?.map((msg, idx) => (
    <Accordion key={msg.idx} defaultExpanded={idx === 0}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <b>
          #{idx + 1} {getMessageName(msg.type)}
        </b>
      </AccordionSummary>
      <AccordionDetails>
        <ItemContainer>
          <RowItem
            label="Content"
            value={
              <Typography sx={{ fontStyle: 'italic' }}>
                {translateCts(msg.content.ctm, (address, idx) => (
                  <AddressLink key={idx} address={address} display={address} />
                ))}
              </Typography>
            }
          />
          <RowItem label="Type" value={msg.type} />
          <RowItem
            label="Proto Message"
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
        </ItemContainer>
      </AccordionDetails>
    </Accordion>
  ));
}
