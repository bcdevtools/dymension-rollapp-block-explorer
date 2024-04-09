import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import React from 'react';

type PageTitleProps = Readonly<{
  title: string;
  subtitle?: React.ReactNode | null;
}>;

export default function PageTitle({ title, subtitle }: PageTitleProps) {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5">
        <b>{title}</b>
      </Typography>
      {subtitle && <Typography variant="subtitle1">{subtitle}</Typography>}
    </Box>
  );
}
