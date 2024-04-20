import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Modal from '@mui/material/Modal';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { SEARCH_PLACEHOLDER } from '@/consts/setting';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import { useCallback, useEffect, useState } from 'react';
import { SearchResult, handleGlobalSearch } from '@/services/search.service';
import { useRollappStore } from '@/stores/rollappStore';
import { useMountedState } from '@/hooks/useMountedState';
import Box from '@mui/material/Box';
import SearchResultContent from './_SearchResultContent';
import CircularProgress from '@mui/material/CircularProgress';

type SearchProps = Readonly<{
  open: boolean;
  handleClose: () => void;
}>;

const StyledCard = styled(Card)(({ theme }) => ({
  width: '100vw',
  height: '100vh',
  maxHeight: '100vh',
  [theme.breakpoints.up('sm')]: {
    width: 600,
    height: 650,
  },
}));

export default function Search({ open, handleClose }: SearchProps) {
  const [searchValue, setSearchValue] = useState<string>('');
  const [{ rollappInfos, selectedRollappInfo }] = useRollappStore();
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const mounted = useMountedState();

  const reset = () => {
    setSearchValue('');
    setLoading(false);
  };

  const handleSearch = useCallback(
    async (_searchValue: string) => {
      try {
        setLoading(true);
        const result = await handleGlobalSearch(
          _searchValue,
          rollappInfos,
          selectedRollappInfo
        );
        if (mounted.current) {
          setSearchResult(result);
        }
      } finally {
        if (mounted.current) setLoading(false);
      }
    },
    [rollappInfos, selectedRollappInfo, mounted]
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (mounted.current) handleSearch(searchValue);
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchValue, handleSearch, mounted]);

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        handleClose();
      }}
      sx={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
      <StyledCard>
        <CardContent sx={{ p: 0, height: '100%' }}>
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
                  <IconButton onClick={handleClose}>
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
              searchText={searchValue}
              handleClickSearchItem={handleClose}
            />
          )}
        </CardContent>
      </StyledCard>
    </Modal>
  );
}
