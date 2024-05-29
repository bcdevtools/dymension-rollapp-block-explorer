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
import { useEffect, useState } from 'react';
import { getFavoriteRollapps, setFavoriteRollapp } from '@/utils/rollapp';

const baseStyle = {
  fontFamily: 'monospace',
  fontWeight: 700,
  letterSpacing: '.3rem',
};

export default function Logo({ isDark }: Readonly<{ isDark: boolean }>) {
  const [{ selectedRollappInfo }] = useRollappStore();
  const [isFavorite, setFavorite] = useState(false);
  const pathname = usePathname();
  const logoHref = getNewPathByRollapp(pathname, Path.OVERVIEW);
  const appName = selectedRollappInfo?.name.toUpperCase();

  useEffect(() => {
    if (!selectedRollappInfo) {
      setFavorite(false);
      return;
    }
    const favoriteRollapps = getFavoriteRollapps();
    setFavorite(favoriteRollapps[selectedRollappInfo.chain_id]);
  }, [selectedRollappInfo]);

  const handleClickFavorite = () => {
    if (!selectedRollappInfo) return;
    const newFavorite = !isFavorite;
    setFavoriteRollapp(selectedRollappInfo!.chain_id, newFavorite);
    setFavorite(newFavorite);
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
      {isFavorite ? <StarIcon onClick={handleClickFavorite} /> : <StarOutlineIcon onClick={handleClickFavorite} />}
    </Box>
  );
}
