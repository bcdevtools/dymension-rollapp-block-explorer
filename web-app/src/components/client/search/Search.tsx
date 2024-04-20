'use client';

import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { SEARCH_PLACEHOLDER } from '@/consts/setting';
import IconButton from '@mui/material/IconButton';
import { useCallback, useEffect, useState } from 'react';
import { SearchResult, handleGlobalSearch } from '@/services/search.service';
import { useRollappStore } from '@/stores/rollappStore';
import { useMountedState } from '@/hooks/useMountedState';
import Box from '@mui/material/Box';
import SearchResultContent from './_SearchResultContent';
import CircularProgress from '@mui/material/CircularProgress';
import SearchResultDisplayContext, {
  Columns,
} from '@/contexts/SearchResultDisplayContext';

type SearchProps = Readonly<{
  onClear?: () => void;
  columns?: Columns;
}>;

export default function Search({
  onClear = () => {},
  columns = 1,
}: SearchProps) {
  const [searchValue, setSearchValue] = useState<string>('');
  const [{ rollappInfos, selectedRollappInfo }] = useRollappStore();
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const mounted = useMountedState();

  const handleClear = () => {
    if (mounted.current) setSearchValue('');
    onClear();
  };

  const handleSearch = useCallback(
    async (_searchValue: string) => {
      setLoading(true);
      const result = await handleGlobalSearch(
        _searchValue,
        rollappInfos,
        selectedRollappInfo
      );
      if (mounted.current) {
        setSearchResult(result);
        setLoading(false);
      }
    },
    [rollappInfos, selectedRollappInfo, mounted]
  );

  useEffect(() => {
    if (!searchValue && !selectedRollappInfo) {
      setSearchResult({ rollapps: rollappInfos });
      return;
    }
    const timeout = setTimeout(() => {
      if (mounted.current) handleSearch(searchValue);
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchValue, handleSearch, mounted, selectedRollappInfo, rollappInfos]);

  return (
    <SearchResultDisplayContext.Provider value={{ displayColumns: columns }}>
      <TextField
        value={searchValue}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setSearchValue(e.target.value)
        }
        fullWidth
        placeholder={SEARCH_PLACEHOLDER}
        inputRef={e => e && setTimeout(() => e.focus(), 0)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={handleClear}>
                <CloseIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      {loading || !searchResult ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
          p={2}>
          <CircularProgress />
        </Box>
      ) : (
        <SearchResultContent
          searchResult={searchResult}
          handleClickSearchItem={handleClear}
        />
      )}
    </SearchResultDisplayContext.Provider>
  );
}
