import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

export default function Label({ text }: Readonly<{ text: string }>) {
  return (
    <Grid item xs={12} sm={3}>
      <Typography color="grey">{text}</Typography>
    </Grid>
  );
}
