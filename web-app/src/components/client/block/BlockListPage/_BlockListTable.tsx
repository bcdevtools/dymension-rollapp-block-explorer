import { Block } from '@/consts/rpcResTypes';
import useBlockList from '@/hooks/useBlockList';
import { formatUnixTime } from '@/utils/common';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import { GridColDef, DataGrid, GridPaginationModel } from '@mui/x-data-grid';
import { usePathname } from 'next/navigation';
import React, { useMemo, useState } from 'react';

type BlockListTableProps = Readonly<{
  latestBlockNo: number;
}>;

export default function BlockListTable({ latestBlockNo }: BlockListTableProps) {
  const pathname = usePathname();
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: 25,
    page: 0,
  });

  const [blocks, loading] = useBlockList(
    latestBlockNo,
    paginationModel.page,
    paginationModel.pageSize
  );

  const columns: GridColDef<Block>[] = useMemo(
    () => [
      {
        field: 'height',
        headerName: 'Block',
        renderCell: params => (
          <Link href={`${pathname}/${params.value}`} underline="hover">
            {params.value}
          </Link>
        ),
        flex: 1,
      },
      {
        field: 'timeEpochUTC',
        headerName: 'Date Time',
        valueGetter: (value: number, row) => formatUnixTime(value),
        flex: 1,
      },
      {
        field: 'txs',
        headerName: 'Txs',
        valueGetter: (value: any[], row) => value.length,
        flex: 1,
      },
    ],
    [pathname]
  );

  return (
    <Box sx={{ width: '100%' }}>
      <DataGrid
        rows={blocks}
        columns={columns}
        getRowId={row => row.height}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[10, 25, 50, 100]}
        disableRowSelectionOnClick
        disableColumnSorting
        disableColumnMenu
        disableColumnResize
        paginationMode="server"
        loading={loading}
        rowCount={latestBlockNo}
        sx={{
          '& .MuiDataGrid-cell:focus-within, & .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus-within, & .MuiDataGrid-columnHeader:focus':
            { outline: 'none' },
        }}
      />
    </Box>
  );
}
