import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Grid from '@mui/material/Grid';
import TableContainer from '@mui/material/TableContainer';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import PageTitle from '@/components/commons/PageTitle';

function createData(
  name: string,
  calories: number,
  fat: number,
  carbs: number,
  protein: number
) {
  return { name, calories, fat, carbs, protein };
}

const rows = [
  createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
  createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
  createData('Eclair', 262, 16.0, 24, 6.0),
  createData('Cupcake', 305, 3.7, 67, 4.3),
  createData('Gingerbread', 356, 16.0, 49, 3.9),
];

function BlockSummaryCard({
  label,
  children,
}: Readonly<{ label: string; children: React.ReactNode }>) {
  return (
    <Grid item xs={6} md={3}>
      <Paper sx={{ p: 1 }} elevation={3}>
        <Grid container>
          <Grid item xs={12}>
            <Typography color="gray">{label}</Typography>
          </Grid>
          <Grid item xs={12}>
            {children}
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  );
}

export default function Blocks() {
  return (
    <>
      <PageTitle title="Blocks" />
      <Grid container spacing={2} sx={{ my: 2 }}>
        <BlockSummaryCard label="Total blocks">
          <Typography>test</Typography>
        </BlockSummaryCard>
        <BlockSummaryCard label="Total Transactions">
          <Typography>test</Typography>
        </BlockSummaryCard>
        <BlockSummaryCard label="Total blocks">
          <Typography>test</Typography>
        </BlockSummaryCard>
        <BlockSummaryCard label="Total blocks">
          <Typography>test</Typography>
        </BlockSummaryCard>
      </Grid>
      <Divider sx={{ my: 4 }} />
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Dessert (100g serving)</TableCell>
              <TableCell align="right">Calories</TableCell>
              <TableCell align="right">Fat&nbsp;(g)</TableCell>
              <TableCell align="right">Carbs&nbsp;(g)</TableCell>
              <TableCell align="right">Protein&nbsp;(g)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(row => (
              <TableRow
                key={row.name}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell component="th" scope="row">
                  {row.name}
                </TableCell>
                <TableCell align="right">{row.calories}</TableCell>
                <TableCell align="right">{row.fat}</TableCell>
                <TableCell align="right">{row.carbs}</TableCell>
                <TableCell align="right">{row.protein}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
