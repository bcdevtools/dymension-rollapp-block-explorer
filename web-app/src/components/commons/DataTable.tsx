'use client';

import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TablePagination from '@mui/material/TablePagination';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
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

type TablePaginationActionsProps = Readonly<{
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (
    event: React.MouseEvent<HTMLButtonElement>,
    newPage: number
  ) => void;
}>;

function TablePaginationActions({
  count,
  page,
  rowsPerPage,
  onPageChange,
}: TablePaginationActionsProps) {
  const maxPage = Math.ceil(count / rowsPerPage) - 1;
  const handleFirstPageButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    onPageChange(event, Math.max(0, maxPage));
  };

  return (
    <Box flexShrink={0} marginLeft={2.5}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        color="secondary"
        disabled={page === 0}
        aria-label="first page">
        <FirstPageIcon />
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        color="secondary"
        disabled={page === 0}
        aria-label="previous page">
        <KeyboardArrowLeft />
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        color="secondary"
        disabled={page >= maxPage}
        aria-label="next page">
        <KeyboardArrowRight />
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        color="secondary"
        disabled={page >= maxPage}
        aria-label="last page">
        <LastPageIcon />
      </IconButton>
    </Box>
  );
}

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
              <TableRow key={rowKeys[idx] || idx}>
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
          slotProps={{
            select: {
              inputProps: { 'aria-label': 'rows per page' },
              native: true,
            },
          }}
          onPageChange={(e, newPage: number) => onPageChange(newPage)}
          onRowsPerPageChange={e => onRowsPerPageChange(e.target.value)}
          ActionsComponent={TablePaginationActions}
        />
      )}
    </>
  );
}
