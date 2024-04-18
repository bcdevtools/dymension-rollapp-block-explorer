'use client';

import SearchIcon from '@mui/icons-material/Search';
import SendIcon from '@mui/icons-material/Send';
import RollappSelect from './commons/RollappSelect';
import { FormEventHandler, useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import { SEARCH_PLACEHOLDER } from '@/consts/setting';
import { useRouter } from 'next/navigation';
import { handleSearch } from '@/utils/common';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Slide from '@mui/material/Slide';
import Link from 'next/link';
import { useRollappStore } from '@/stores/rollappStore';

export default function Home() {
  const [{ rollappInfos }] = useRollappStore(true);
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

    if (!rollappPath) {
      setHasTriedSubmit(true);
      return;
    }
    handleSearch(
      rollappInfos.find(i => i.path === rollappPath)!,
      searchValue,
      newPath => router.push(newPath)
    );
  };

  return (
    <Grid
      component="form"
      display="flex"
      justifyContent="center"
      onSubmit={handleSubmit}
      container
      sx={{ width: { xs: '75vw', lg: '50vw' } }}
      spacing={1}>
      <Grid item xs={12}>
        <RollappSelect
          value={rollappPath}
          label="Rollapps"
          onValueChange={e => setRollappPath(e.target.value)}
          fullWidth
          error={error}
          size="small"
        />
      </Grid>
      {rollappPath && (
        <>
          <Slide in direction="up">
            <Grid item xs={12}>
              <TextField
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                fullWidth
                placeholder={SEARCH_PLACEHOLDER}
                size="small"
              />
            </Grid>
          </Slide>
          <Slide in direction="up">
            <Grid item xs={12} display="flex" justifyContent="center">
              <Button
                component={Link}
                variant="outlined"
                startIcon={<SendIcon />}
                type="button"
                href={rollappPath}
                sx={{ mr: 1 }}>
                Explore Rollapp
              </Button>
              <Button
                variant="contained"
                endIcon={<SearchIcon />}
                type="submit">
                Search
              </Button>
            </Grid>
          </Slide>
        </>
      )}
    </Grid>
  );
}
