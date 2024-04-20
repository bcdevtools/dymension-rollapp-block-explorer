import { APP_NAME } from '@/consts/setting';
import Typography from '@mui/material/Typography';

export default function Logo() {
  return (
    <>
      <Typography
        variant="h6"
        noWrap
        component="div"
        sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
        {APP_NAME}
      </Typography>
      <Typography
        variant="h5"
        noWrap
        component="div"
        sx={{ display: { xs: 'flex', md: 'none' } }}>
        {APP_NAME}
      </Typography>
    </>
  );
}
