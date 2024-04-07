import { Block } from '@/consts/rpcResTypes';
import useBlockList from '@/hooks/useBlockList';
import { formatUnixTime } from '@/utils/common';
import Link from '@mui/material/Link';
import { GridColDef, DataGrid, GridPaginationModel } from '@mui/x-data-grid';
import { usePathname } from 'next/navigation';
import React, { useMemo, useState } from 'react';

type BlockListProps = Readonly<{
  latestBlockNo: number;
}>;

export default function BlockList({ latestBlockNo }: BlockListProps) {
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
      },
      {
        field: 'timeEpochUTC',
        headerName: 'Date Time',
        valueGetter: (value: number, row) => formatUnixTime(value),
      },
      {
        field: 'txs',
        headerName: 'Txs',
        valueGetter: (value: any[], row) => value.length,
      },
    ],
    [pathname]
  );

  return (
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
  );
}
