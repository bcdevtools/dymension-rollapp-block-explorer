'use client';

import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import { SearchResult } from '@/services/search.service';
import Grid from '@mui/material/Grid';
import CardActionArea from '@mui/material/CardActionArea';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Path } from '@/consts/path';
import SearchResultDisplayContext from '@/contexts/SearchResultDisplayContext';
import Link from 'next/link';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import StarIcon from '@mui/icons-material/Star';

function SearchResultItem({
  rollappName,
  chainId,
  value,
  handleClick,
  href,
  isFavourite,
}: Readonly<{
  rollappName: string;
  chainId: string;
  value?: string;
  handleClick: () => void;
  href: string;
  isFavourite?: boolean;
}>) {
  return (
    <SearchResultDisplayContext.Consumer>
      {({ displayColumns }) => (
        <Grid item xs={12} md={12 / displayColumns}>
          <Card variant="outlined">
            <CardActionArea component={Link} href={href} prefetch={false} onClick={handleClick}>
              <CardHeader
                title={
                  <>
                    <Typography component="span">
                      <strong>{rollappName}</strong>
                    </Typography>{' '}
                    {value && (
                      <Typography width="100%" component="span" color="text.secondary" variant="subtitle2">
                        {chainId}
                      </Typography>
                    )}
                  </>
                }
                subheader={
                  <Typography variant="subtitle1" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                    {value || chainId}
                  </Typography>
                }
                avatar={<Avatar aria-label="recipe">{rollappName[0].toUpperCase()} </Avatar>}
                action={isFavourite !== undefined && (isFavourite ? <StarIcon /> : <StarOutlineIcon />)}
              />
            </CardActionArea>
          </Card>
        </Grid>
      )}
    </SearchResultDisplayContext.Consumer>
  );
}

function SearchResultSection({ children, title }: Readonly<{ children: React.ReactNode; title: string }>) {
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
  handleClickSearchItem,
}: Readonly<{
  searchResult: SearchResult;
  handleClickSearchItem: () => void;
}>) {
  if (!Object.keys(searchResult).length) {
    return (
      <Box height="100%" width="100%" display="flex" justifyContent="center" alignItems="center">
        No result found.
      </Box>
    );
  }
  const { blocks, txs, accounts, rollapps } = searchResult;

  return (
    <Box p={2} overflow="auto" height="100%">
      <Grid container spacing={2}>
        {rollapps && (
          <SearchResultSection title={`Rollapps (${rollapps.length})`}>
            {rollapps.map(rollapp => (
              <SearchResultItem
                key={rollapp.chain_id}
                rollappName={rollapp.name.toUpperCase()}
                chainId={rollapp.chain_id}
                href={rollapp.path}
                handleClick={handleClickSearchItem}
                isFavourite={rollapp.isFavorite}
              />
            ))}
          </SearchResultSection>
        )}
        {blocks && (
          <SearchResultSection title={`Block (${blocks.rollappInfos.length})`}>
            {blocks.rollappInfos.map(rollapp => (
              <SearchResultItem
                key={rollapp.chain_id}
                rollappName={rollapp.name.toUpperCase()}
                chainId={rollapp.chain_id}
                value={`#${blocks.block}`}
                href={`${rollapp.path}${Path.BLOCK}/${blocks.block}`}
                handleClick={handleClickSearchItem}
              />
            ))}
          </SearchResultSection>
        )}
        {txs && (
          <SearchResultSection title={`Transaction (${txs.length})`}>
            {txs.map(({ rollappInfo, txHash }) => (
              <SearchResultItem
                key={rollappInfo.chain_id}
                rollappName={rollappInfo.name.toUpperCase()}
                chainId={rollappInfo.chain_id}
                value={txHash}
                href={`${rollappInfo.path}${Path.TRANSACTION}/${txHash}`}
                handleClick={handleClickSearchItem}
              />
            ))}
          </SearchResultSection>
        )}
        {accounts && (
          <SearchResultSection title={`Address`}>
            {accounts.rollappInfos.map(rollappInfo => (
              <SearchResultItem
                key={rollappInfo.chain_id}
                rollappName={rollappInfo.name.toUpperCase()}
                chainId={rollappInfo.chain_id}
                value={accounts.account}
                href={`${rollappInfo.path}${Path.ADDRESS}/${accounts.account}`}
                handleClick={handleClickSearchItem}
              />
            ))}
          </SearchResultSection>
        )}
      </Grid>
    </Box>
  );
}
