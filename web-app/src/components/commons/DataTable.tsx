'use client';

import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TablePagination from '@mui/material/TablePagination';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

type DataTableProps = Readonly<{
  headers: React.ReactNode[];
  body: React.ReactNode[][];
  rowKeys: string[] | number[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (pageSize: string) => void;
  loading?: boolean;
  enablePagination?: boolean;
  loadingItems?: number;
  summaryRows?: React.ReactNode;
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
  loading,
  loadingItems,
  enablePagination = true,
  summaryRows,
}: DataTableProps) {
  const _body: React.ReactNode[][] = loading
    ? Array(loadingItems || pageSize).fill(
        Array(headers.length).fill(<Skeleton />)
      )
    : body;

  if (!_body.length)
    return (
      <Box display="flex" justifyContent="center" padding={5}>
        No data
      </Box>
    );

  const showPagniation = enablePagination && total > pageSize;
  return (
    <>
      <TableContainer sx={{ width: '100%' }}>
        <Table sx={{ overflowX: 'scroll' }}>
          <TableHead>
            <TableRow>
              {headers.map((header, idx) => (
                <TableCell key={idx}>
                  <Typography color="text.secondary">
                    <b>{header}</b>
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody
            sx={
              !showPagniation
                ? { '&:last-child td, &:last-child th': { border: 0 } }
                : {}
            }>
            {_body.map((row, idx) => (
              <TableRow key={rowKeys[idx] ?? idx}>
                {row.map((cell, idx) => (
                  <TableCell key={idx}>{cell}</TableCell>
                ))}
              </TableRow>
            ))}
            {!loading && summaryRows}
          </TableBody>
        </Table>
      </TableContainer>
      {showPagniation && (
        <TablePagination
          component="div"
          rowsPerPageOptions={[10, 25, 50, 100]}
          count={total}
          rowsPerPage={pageSize}
          page={page}
          onPageChange={(e, newPage: number) => onPageChange(newPage)}
          onRowsPerPageChange={e => onRowsPerPageChange(e.target.value)}
          showFirstButton
          showLastButton
        />
      )}
    </>
  );
}
