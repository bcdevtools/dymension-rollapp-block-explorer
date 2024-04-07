import { Block } from '@/consts/rpcResTypes';
import { useRollappStore } from '@/stores/rollappStore';
import { GridColDef, DataGrid, GridPaginationModel } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';

type BlockListProps = Readonly<{
  latestBlockNo: number;
}>;

const columns: GridColDef<Block>[] = [
  { field: 'height', headerName: 'Block' },
  { field: 'timeEpochUTC', headerName: 'Age' },
];

export default function BlockList({ latestBlockNo }: BlockListProps) {
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: 25,
    page: 0,
  });

  const [{ rpcService }] = useRollappStore();
  const [blocks, setBlocks] = useState<Block[]>([]);

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
