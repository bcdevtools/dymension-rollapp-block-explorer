import { Block } from '@/consts/rpcResTypes';
import { useRollappStore } from '@/stores/rollappStore';
import { Link } from '@mui/material';
import { GridColDef, DataGrid, GridPaginationModel } from '@mui/x-data-grid';
import { usePathname } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';

type BlockListProps = Readonly<{
  latestBlockNo: number;
}>;

export default function BlockList({ latestBlockNo }: BlockListProps) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: 25,
    page: 0,
  });

  const [{ rpcService }] = useRollappStore();
  const [blocks, setBlocks] = useState<Block[]>([]);

  const columns: GridColDef<Block>[] = useMemo(
    () => [
      {
        field: 'height',
        headerName: 'Block',
        renderCell: params => (
          <Link href={`${pathname}${params.value}`} underline="hover">
            {params.value}
          </Link>
        ),
      },
      { field: 'timeEpochUTC', headerName: 'Age' },
      {
        field: 'txs',
        headerName: 'Txs',
        valueGetter: (value: any[], row) => value.length,
      },
    ],
    [pathname]
  );

  useEffect(() => {
    const ac = new AbortController();
    let ignore = false;
    if (rpcService && latestBlockNo) {
      (async function () {
        try {
          setLoading(true);
          const topPageBlockNo =
            latestBlockNo - paginationModel.page * paginationModel.pageSize;
          const _blocks = await rpcService.getBlockByNumber(
            Array.from(
              Array(Math.min(topPageBlockNo, paginationModel.pageSize))
            ).map((i, idx) => topPageBlockNo - idx),
            { signal: ac.signal }
          );
          setBlocks(_blocks);
        } catch (e) {
          console.log(e);
        } finally {
          if (!ignore) setLoading(false);
        }
      })();
    } else setBlocks([]);
    return () => {
      ac.abort();
      ignore = true;
    };
  }, [latestBlockNo, rpcService, paginationModel]);

  return (
    <DataGrid
      rows={blocks}
      columns={columns}
      getRowId={row => row.height}
      paginationModel={paginationModel}
      onPaginationModelChange={setPaginationModel}
      pageSizeOptions={[10, 25, 50, 100]}
      disableRowSelectionOnClick
      paginationMode="server"
      loading={loading}
      rowCount={latestBlockNo}
    />
  );
}
