import Typography from '@mui/material/Typography';

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Rollapp Block Explorer';

export default function Logo() {
  return (
    <>
      <Typography
        variant="h6"
        noWrap
        component="div"
        sx={{ flexGrow: 1, display: { xs: 'none', sm: 'flex' } }}>
        {APP_NAME}
      </Typography>
      <Typography
        variant="h5"
        noWrap
        component="div"
        sx={{ display: { xs: 'flex', sm: 'none' } }}>
        {APP_NAME}
      </Typography>
    </>
  );
}
