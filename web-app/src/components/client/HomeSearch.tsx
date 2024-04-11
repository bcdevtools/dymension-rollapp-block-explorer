'use client';

import SearchIcon from '@mui/icons-material/Search';
import RollappSelect from './commons/RollappSelect';
import { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  p: '2px 4px',
  display: 'flex',
  alignItems: 'center',
  height: 40,
  width: '100%',
  backgroundColor: theme.palette.background.default,
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'none',
  },
}));

const placeholder = 'Address, Block, Transaction hash, etc.';

export default function HomeSearch() {
  const [rollappPath, setRollappPath] = useState<string>('');
  const [searchValue, setSearchValue] = useState<string>('');

  return (
    <Grid container sx={{ width: { xs: '75vw', lg: '50vw' } }} spacing={1}>
      <Grid item xs={12} md={3}>
        <RollappSelect
          value={rollappPath}
          label="Rollapp"
          onChange={e => setRollappPath(e.target.value)}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} md={9}>
        <StyledTextField placeholder={placeholder} fullWidth size="small" />
        <StyledPaper sx={{ width: '100%' }}>
          <InputBase sx={{ ml: 1, flex: 1 }} placeholder={placeholder} />
          <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
            <SearchIcon />
          </IconButton>
        </StyledPaper>
      </Grid>
      <Grid
        item
        xs={12}
        justifyContent="center"
        sx={{ display: { xs: 'flex', md: 'none' } }}>
        <Button variant="contained" startIcon={<SearchIcon />}>
          Search
        </Button>
      </Grid>
    </Grid>
  );
}
