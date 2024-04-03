'use client';

import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import React from 'react';
import { usePathname } from 'next/navigation';
import { getNewPathOnMenuClick } from '@/utils/common';
import { BreadcrumbName, Path } from '@/consts/path';

export default function PageBreadcrumb() {
  const pathname = usePathname();
  const splittedPath = pathname.split('/').filter(path => path);

  return (
    <Breadcrumbs aria-label="breadcrumb">
      <Link
        underline="hover"
        color="inherit"
        href={getNewPathOnMenuClick(pathname, Path.OVERVIEW)}>
        Home
      </Link>
      {splittedPath.map((value, idx) => {
        if (idx === 0) return null;
        const isLast = idx === splittedPath.length - 1;
        const to = `/${value}`;
        const breadcrumbName = BreadcrumbName[to as Path];

        return isLast ? (
          <Typography color="text.primary" key={idx}>
            {breadcrumbName || (isNaN(+value) ? value : `#${value}`)}
          </Typography>
        ) : (
          <Link
            underline="hover"
            color="inherit"
            href={getNewPathOnMenuClick(pathname, to)}
            key={idx}>
            {breadcrumbName}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
}
