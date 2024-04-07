import Grid from '@mui/material/Grid';
import PageTitle from '@/components/server/commons/PageTitle';
import Typography from '@mui/material/Typography';
import Label from '@/components/server/detail/Label';
import Value from '@/components/server/detail/Value';

type TransactionsProps = Readonly<{
  params: { txHash: string };
}>;

export default function Transaction({ params }: TransactionsProps) {
  return (
    <>
      <PageTitle title="Transaction detail" />
      <Grid container sx={{ mt: 2 }}>
        <Label text="Block height" />
        <Value>
          <Typography>{params.txHash}</Typography>
        </Value>
        <Label text="Status" />
        <Value>
          <Typography>Success</Typography>
        </Value>
      </Grid>
    </>
  );
}
