'use client';

import { Path } from '@/consts/path';
import { useRollappStore } from '@/stores/rollappStore';
import { getNewPathByRollapp } from '@/utils/common';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { usePathname } from 'next/navigation';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import StarIcon from '@mui/icons-material/Star';
import Box from '@mui/material/Box';
import { RollappActionTypes } from '@/consts/actionTypes';

const baseStyle = {
  fontFamily: 'monospace',
  fontWeight: 700,
  letterSpacing: '.3rem',
};

export default function Logo({ isDark }: Readonly<{ isDark: boolean }>) {
  const [{ selectedRollappInfo }, dispatch] = useRollappStore();
  const pathname = usePathname();
  const logoHref = getNewPathByRollapp(pathname, Path.OVERVIEW);
  const appName = selectedRollappInfo?.name.toUpperCase();

  const handleClickFavorite = () => {
    if (!selectedRollappInfo) return;
    dispatch(RollappActionTypes.RE_ORDER_ROLLAPPS, {
      chainId: selectedRollappInfo.chain_id,
      isFavorite: !selectedRollappInfo.isFavorite,
    });
  };

  return (
    <Box flexGrow={{ md: 1 }} maxWidth="calc(100vw - 160px)" display="flex" alignItems="center">
      <Typography
        variant="h5"
        noWrap
        component={Link}
        href={logoHref}
        underline="none"
        color={isDark ? 'primary' : 'inherit'}
        sx={{ ...baseStyle }}
        mr={1}>
        {appName}
      </Typography>
      {selectedRollappInfo?.isFavorite ? (
        <StarIcon onClick={handleClickFavorite} />
      ) : (
        <StarOutlineIcon onClick={handleClickFavorite} />
      )}
    </Box>
  );
}
