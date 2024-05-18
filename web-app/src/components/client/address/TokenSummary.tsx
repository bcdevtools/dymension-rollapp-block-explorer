'use client';

import Card from '@/components/commons/Card';
import React from 'react';
import { ContractAccountInfo } from '@/consts/rpcResTypes';
import Grid from '@mui/material/Grid';
import { DetailItem } from '@/components/commons/DetailItem';

type TokenSummaryProps = Readonly<{
  contract: ContractAccountInfo;
  loading: boolean;
}>;

export default React.memo(function TokenSummary({
  contract,
  loading,
}: TokenSummaryProps) {
  return (
    <Card sx={{ mb: 3 }}>
      <Grid container spacing={1}>
        <DetailItem label="Name" value={contract.name} loading={loading} />
        <DetailItem label="Symbol" value={contract.symbol} loading={loading} />
        <DetailItem
          label="Decimals"
          value={contract.decimals}
          loading={loading}
        />
      </Grid>
    </Card>
  );
});
