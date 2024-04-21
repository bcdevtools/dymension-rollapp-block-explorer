import { Path } from '@/consts/path';
import { useRollappStore } from '@/stores/rollappStore';
import { getNewPathByRollapp } from '@/utils/common';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { usePathname } from 'next/navigation';

const baseStyle = {
  fontFamily: 'monospace',
  fontWeight: 700,
  letterSpacing: '.3rem',
};

export default function Logo() {
  const [{ selectedRollappInfo }] = useRollappStore();
  const pathname = usePathname();
  const logoHref = getNewPathByRollapp(pathname, Path.OVERVIEW);
  const appName = selectedRollappInfo?.name.toUpperCase();

  return (
    <>
      <Typography
        component={Link}
        href={logoHref}
        underline="none"
        color="inherit"
        variant="h6"
        noWrap
        sx={{ ...baseStyle, flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
        {appName}
      </Typography>
      <Typography
        variant="h5"
        noWrap
        component={Link}
        href={logoHref}
        underline="none"
        color="inherit"
        sx={{ ...baseStyle, display: { xs: 'flex', md: 'none' } }}>
        {appName}
      </Typography>
    </>
  );
}
