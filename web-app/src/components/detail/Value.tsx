import Grid from '@mui/material/Grid';

export default function Value({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Grid item xs={12} sm={9}>
      {children}
    </Grid>
  );
}
