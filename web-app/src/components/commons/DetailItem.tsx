import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';

export function DetailItem({
  label,
  value,
}: Readonly<{ label: string; value: React.ReactNode | string }>) {
  return (
    <Grid container item>
      <Grid xs={12} lg={3}>
        <Typography color="text.secondary">{label}</Typography>
      </Grid>
      <Grid xs={12} lg={9}>
        {typeof value === 'string' ? <Typography>{value}</Typography> : value}
      </Grid>
    </Grid>
  );
}
