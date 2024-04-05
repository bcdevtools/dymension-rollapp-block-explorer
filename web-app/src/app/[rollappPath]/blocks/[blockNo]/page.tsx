import Grid from '@mui/material/Grid';
import PageTitle from '@/components/commons/PageTitle';
import Typography from '@mui/material/Typography';
import Label from '@/components/detail/Label';
import Value from '@/components/detail/Value';

type BlockProps = Readonly<{
  params: { blockNo: string };
}>;

export default function Block({ params }: BlockProps) {
  return (
    <>
      <PageTitle title="Block detail" />
      <Grid container sx={{ mt: 2 }}>
        <Label text="Block height" />
        <Value>
          <Typography>{params.blockNo}</Typography>
        </Value>
        <Label text="Status" />
        <Value>
          <Typography>Success</Typography>
        </Value>
      </Grid>
    </>
  );
}
