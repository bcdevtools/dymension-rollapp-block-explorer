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
    <Typography
      variant="h5"
      noWrap
      component={Link}
      href={logoHref}
      underline="none"
      maxWidth="calc(100vw - 160px)"
      flexGrow={{ md: 1 }}
      sx={{ ...baseStyle }}>
      {appName}
    </Typography>
  );
}
