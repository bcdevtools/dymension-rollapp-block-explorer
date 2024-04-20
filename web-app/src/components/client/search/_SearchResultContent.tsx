'use client';

import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import { SearchResult } from '@/services/search.service';
import Grid from '@mui/material/Grid';
import CardActionArea from '@mui/material/CardActionArea';
import Avatar from '@mui/material/Avatar';
import { Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { Path } from '@/consts/path';

function SearchResultItem({
  rollappName,
  chainId,
  value,
  handleClick,
}: Readonly<{
  rollappName: string;
  chainId: string;
  value?: string;
  handleClick: () => void;
}>) {
  return (
    <Grid item xs={12}>
      <Card variant="outlined">
        <CardActionArea onClick={handleClick}>
          <CardHeader
            title={
              <>
                <Typography component="span">
                  <strong>{rollappName}</strong>
                </Typography>{' '}
                {value && (
                  <Typography
                    width="100%"
                    component="span"
                    color="grey"
                    variant="subtitle2">
                    {chainId}
                  </Typography>
                )}
              </>
            }
            subheader={
              <Typography
                variant="subtitle1"
                color="text.secondary"
                sx={{ wordBreak: 'break-word' }}>
                {value || chainId}
              </Typography>
            }
            avatar={
              <Avatar aria-label="recipe">
                {rollappName[0].toUpperCase()}{' '}
              </Avatar>
            }
          />
        </CardActionArea>
      </Card>
    </Grid>
  );
}

function SearchResultSection({
  children,
  title,
}: Readonly<{ children: React.ReactNode; title: string }>) {
  return (
    <Grid container item spacing={1}>
      <Grid item xs={12}>
        <b>{title}</b>
      </Grid>
      {children}
    </Grid>
  );
}

export default function SearchResultContent({
  searchResult,
  searchText,
  handleClickSearchItem,
}: Readonly<{
  searchResult: SearchResult;
  searchText: string;
  handleClickSearchItem: () => void;
}>) {
  const { blocks, txs, accounts, rollapps } = searchResult;
  const router = useRouter();
  return (
    <Grid container spacing={2}>
      {rollapps && (
        <SearchResultSection title={`Rollapps (${rollapps.length})`}>
          {rollapps.map(rollapp => (
            <SearchResultItem
              key={rollapp.chain_id}
              rollappName={rollapp.name}
              chainId={rollapp.chain_id}
              handleClick={() => {
                router.push(rollapp.path);
                handleClickSearchItem();
              }}
            />
          ))}
        </SearchResultSection>
      )}
      {blocks && (
        <SearchResultSection title={`Block (${blocks.length})`}>
          {blocks.map(rollapp => (
            <SearchResultItem
              key={rollapp.chain_id}
              rollappName={rollapp.name}
              chainId={rollapp.chain_id}
              value={`#${searchText}`}
              handleClick={() => {
                router.push(`${rollapp.path}${Path.BLOCKS}/${searchText}`);
                handleClickSearchItem();
              }}
            />
          ))}
        </SearchResultSection>
      )}
      {txs && (
        <SearchResultSection title={`Transaction (${txs.length})`}>
          {txs.map(({ rollappInfo, txHash }) => (
            <SearchResultItem
              key={rollappInfo.chain_id}
              rollappName={rollappInfo.name}
              chainId={rollappInfo.chain_id}
              value={txHash}
              handleClick={() => {
                router.push(
                  `${rollappInfo.path}${Path.TRANSACTIONS}/${txHash}`
                );
                handleClickSearchItem();
              }}
            />
          ))}
        </SearchResultSection>
      )}
      {accounts && (
        <SearchResultSection title={`Address`}>
          {accounts.rollappInfos.map(rollappInfo => (
            <SearchResultItem
              key={rollappInfo.chain_id}
              rollappName={rollappInfo.name}
              chainId={rollappInfo.chain_id}
              value={accounts.account}
              handleClick={() => {
                router.push(
                  `${rollappInfo.path}${Path.ADDRESS}/${accounts.account}`
                );
                handleClickSearchItem();
              }}
            />
          ))}
        </SearchResultSection>
      )}
    </Grid>
  );
}
