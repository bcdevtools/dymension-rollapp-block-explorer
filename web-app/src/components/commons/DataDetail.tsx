import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';

type DataDetail = Readonly<{
  label: string;
  value: React.ReactNode;
} | null>;

type DataDetailProps = Readonly<{
  data: DataDetail[];
}>;

export default function DataDetail({ data }: DataDetailProps) {
  return (
    <Grid container spacing={1}>
      {data.map((item, idx) =>
        !item ? (
          <Grid key={`${idx}_divider`} item xs={12} sx={{ my: 2 }}>
            <Divider />
          </Grid>
        ) : (
          <Grid key={`${idx}_${item.label}`} container item>
            <Grid item xs={12} sm={3}>
              <Typography color="text.secondary">{item.label}</Typography>
            </Grid>
            <Grid item xs={12} sm={9}>
              {item.value}
            </Grid>
          </Grid>
        )
      )}
    </Grid>
  );
}
