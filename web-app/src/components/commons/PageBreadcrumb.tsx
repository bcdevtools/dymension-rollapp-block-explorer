'use client';

import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import React from 'react';
import { getNewPathByRollapp } from '@/utils/common';
import { BreadcrumbName, Path } from '@/consts/path';
import { usePathname } from 'next/navigation';

export default function PageBreadcrumb() {
  const pathname = usePathname();
  const splittedPath = pathname.split('/').filter(path => path);

  return (
    <Breadcrumbs aria-label="breadcrumb" sx={{ py: 1, mb: 1 }}>
      <Link
        underline="hover"
        color="inherit"
        href={getNewPathByRollapp(pathname, Path.OVERVIEW)}>
        Home
      </Link>
      {splittedPath.map((value, idx) => {
        if (idx === 0) return null;
        const isLast = idx === splittedPath.length - 1;
        const to = `/${value}`;
        const breadcrumbName = BreadcrumbName[to as Path];

        return isLast ? (
          <Typography color="text.primary" key={idx}>
            {breadcrumbName || (parseInt(value, 10) ? `#${value}` : value)}
          </Typography>
        ) : (
          <Link
            underline="hover"
            color="inherit"
            href={getNewPathByRollapp(pathname, to)}
            key={idx}>
            {breadcrumbName}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
}
