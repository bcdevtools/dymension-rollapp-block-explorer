import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';

type DetailItemProps = Readonly<{
  loading?: boolean;
  label: string;
  value: React.ReactNode | null | undefined;
}>;

export function DetailItem({ label, value, loading = false }: DetailItemProps) {
  const getItemValue = () => {
    if (loading) {
      return <Skeleton />;
    }
    return typeof value === 'string' ? <Typography>{value}</Typography> : value;
  };
  return (
    <Grid container item>
      <Grid xs={12} lg={3}>
        <Typography color="text.secondary">{label}</Typography>
      </Grid>
      <Grid xs={12} lg={9}>
        {getItemValue()}
      </Grid>
    </Grid>
  );
}
