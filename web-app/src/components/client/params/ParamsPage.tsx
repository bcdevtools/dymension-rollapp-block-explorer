'use client';

import Card from '@/components/commons/Card';
import PageTitle from '@/components/commons/PageTitle';
import { MODULES } from '@/consts/params';
import { Path } from '@/consts/path';
import useModuleParams from '@/hooks/useModuleParams';
import { getNewPathByRollapp } from '@/utils/common';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { notFound, useParams, usePathname, useRouter } from 'next/navigation';

export default function ParamsPage() {
  const params = useParams<{ module: string }>();
  const pathname = usePathname();
  const [moduleParams, loading] = useModuleParams(params.module);
  const router = useRouter();

  if (!MODULES.includes(params.module)) return notFound();

  const title = (
    <>
      Params:{' '}
      <Select
        value={params.module}
        label="Module"
        variant="standard"
        onChange={e => router.push(`${getNewPathByRollapp(pathname, Path.PARAMS)}/${e.target.value}`)}>
        {MODULES.map(i => (
          <MenuItem key={i} value={i}>
            {i}
          </MenuItem>
        ))}
      </Select>
    </>
  );

  return (
    <>
      <PageTitle title={title} />
      <Card sx={{ overflowX: 'scroll' }}>
        <pre>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center">
              <CircularProgress />
            </Box>
          ) : (
            JSON.stringify(moduleParams, null, 2)
          )}
        </pre>
      </Card>
    </>
  );
}
