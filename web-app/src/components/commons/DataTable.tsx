'use client';

import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TableFooter from '@mui/material/TableFooter';
import TablePagination from '@mui/material/TablePagination';

type DataTableProps = Readonly<{
  headers: React.ReactNode[];
  body: React.ReactNode[][];
  rowKeys: string[] | number[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (pageSize: string) => void;
}>;

export default function DataTable({
  headers,
  body,
  rowKeys,
  total,
  page,
  pageSize,
  onRowsPerPageChange,
  onPageChange,
}: DataTableProps) {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            {headers.map((header, idx) => (
              <TableCell key={idx}>{header}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {body.map((row, idx) => (
            <TableRow key={rowKeys[idx]}>
              {row.map((cell, idx) => (
                <TableCell key={idx}>{cell}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination
              rowsPerPageOptions={[10, 25, 50, 100]}
              count={total}
              rowsPerPage={pageSize}
              page={page}
              sx={{ border: 0 }}
              slotProps={{
                select: {
                  inputProps: { 'aria-label': 'rows per page' },
                  native: true,
                },
              }}
              onPageChange={(e, newPage: number) => void onPageChange(newPage)}
              onRowsPerPageChange={e =>
                void onRowsPerPageChange(e.target.value)
              }
            />
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  );
}
