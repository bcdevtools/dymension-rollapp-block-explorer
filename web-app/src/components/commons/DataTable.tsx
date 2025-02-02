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
import React from 'react';

type DataTableProps = Readonly<{
  headers: React.ReactNode[];
  body: React.ReactNode[][];
  rowKeys: string[] | number[];
  total?: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange?: (pageSize: string) => void;
  loading?: boolean;
  enablePagination?: boolean;
  loadingItems?: number;
  summaryRows?: React.ReactNode;
  showPaginationOnTop?: boolean;
  noDataTitle?: string;
}>;

export default React.memo(function DataTable({
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
  showPaginationOnTop = true,
  noDataTitle = 'No data',
}: DataTableProps) {
  const _body: React.ReactNode[][] = loading
    ? Array(loadingItems || pageSize).fill(Array(headers.length).fill(<Skeleton />))
    : body;

  if (!_body.length)
    return (
      <Box display="flex" justifyContent="center" padding={5}>
        {noDataTitle}
      </Box>
    );

  const showPagination = enablePagination && (total === undefined || total > pageSize);

  const pagination = showPagination && (
    <TablePagination
      component="div"
      rowsPerPageOptions={total !== undefined ? [10, 25, 50, 100] : []}
      count={total ?? -1}
      rowsPerPage={pageSize}
      page={page}
      onPageChange={(e, newPage: number) => onPageChange(newPage)}
      onRowsPerPageChange={onRowsPerPageChange && (e => onRowsPerPageChange(e.target.value))}
      showFirstButton={total !== undefined}
      showLastButton={total !== undefined}
      labelDisplayedRows={total === undefined ? () => null : undefined}
    />
  );

  return (
    <>
      {showPaginationOnTop && pagination}
      <TableContainer sx={{ width: '100%' }}>
        <Table sx={{ overflowX: 'scroll' }}>
          <TableHead>
            <TableRow>
              {headers.map((header, idx) => (
                <TableCell key={idx}>
                  {typeof header === 'string' ? (
                    <Typography color="text.secondary">
                      <b>{header}</b>
                    </Typography>
                  ) : (
                    header
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody sx={!showPagination ? { '&:last-child td, &:last-child th': { border: 0 } } : {}}>
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
      {pagination}
    </>
  );
});
