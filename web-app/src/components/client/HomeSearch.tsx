'use client';

import SearchIcon from '@mui/icons-material/Search';
import RollappSelect from './commons/RollappSelect';
import { FormEventHandler, useEffect, useRef, useState } from 'react';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import { SEARCH_PLACEHOLDER } from '@/consts/setting';
import { useRouter } from 'next/navigation';
import { getNewPathOnSearch } from '@/utils/common';

const StyledPaper = styled(Paper)(({ theme }) => ({
  p: '2px 4px',
  display: 'flex',
  alignItems: 'center',
  height: 40,
  width: '100%',
  backgroundColor: theme.palette.background.default,
}));

export default function HomeSearch() {
  const [rollappPath, setRollappPath] = useState<string>('');
  const [searchValue, setSearchValue] = useState<string>('');
  const [error, setError] = useState(false);
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (hasTriedSubmit && rollappPath === '') {
      setError(true);
    } else {
      setError(false);
    }
  }, [rollappPath, hasTriedSubmit]);

  const handleSubmit: FormEventHandler = e => {
    e.preventDefault();

    if (!rollappPath || !searchValue) {
      setHasTriedSubmit(true);
      return;
    }
    router.push(getNewPathOnSearch(rollappPath, searchValue));
  };

  return (
    <Grid
      component="form"
      onSubmit={handleSubmit}
      container
      sx={{ width: { xs: '75vw', lg: '50vw' } }}
      spacing={1}>
      <Grid item xs={12} md={3}>
        <RollappSelect
          value={rollappPath}
          label="Rollapp"
          onValueChange={e => setRollappPath(e.target.value)}
          fullWidth
          error={error}
        />
      </Grid>
      <Grid item xs={12} md={9}>
        <StyledPaper sx={{ width: '100%' }}>
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder={SEARCH_PLACEHOLDER}
            value={searchValue}
            onChange={e => void setSearchValue(e.target.value)}
          />
          <IconButton type="submit" sx={{ p: '10px' }} aria-label="search">
            <SearchIcon />
          </IconButton>
        </StyledPaper>
      </Grid>
    </Grid>
  );
}
