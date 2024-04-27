import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import React from 'react';

type PageTitleProps = Readonly<{
  title: React.ReactNode;
  subtitle?: React.ReactNode | null;
}>;

export default function PageTitle({ title, subtitle }: PageTitleProps) {
  return (
    <Box marginBottom={2} marginTop={2}>
      <Typography variant="h5">
        <b>{title}</b>
      </Typography>
      {subtitle && (
        <Typography variant="subtitle2" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}
