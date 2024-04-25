import Grid from '@mui/material/Grid';
import React from 'react';
import Typography from '@mui/material/Typography';

export function ItemContainer({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Grid container spacing={2}>
      {children}
    </Grid>
  );
}

export function RowItem({
  label,
  value,
}: Readonly<{ label: string; value: React.ReactNode | string }>) {
  return (
    <Grid container item>
      <Grid item xs={12} lg={3}>
        <Typography color="text.secondary">{label}</Typography>
      </Grid>
      <Grid item xs={12} lg={9}>
        {typeof value === 'string' ? <Typography>{value}</Typography> : value}
      </Grid>
    </Grid>
  );
}
