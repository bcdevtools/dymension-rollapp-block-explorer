import Grid from '@mui/material/Grid';
import React from 'react';
import Typography from '@mui/material/Typography';
import { divideAmountByDecimals } from '@/utils/number';

export function RowItem({
    label,
    value,
}: Readonly<{ label: string; value: React.ReactNode | string }>) {
    return (
        <Grid container item>
        <Grid item xs={12} lg={3}>
            <Typography color="grey">{label}</Typography>
        </Grid>
        <Grid item xs={12} lg={9}>
            {typeof value === 'string' ? <Typography>{value}</Typography> : value}
        </Grid>
        </Grid>
    );
}

export function fromHexStringToEthereumValue(hexStr: string) {
    return divideAmountByDecimals(`${Number(hexStr)}`, 18).toString()
}

export function fromHexStringToEthereumGasPriceValue(hexStr: string) {
    return divideAmountByDecimals(`${Number(hexStr)}`, 9).toString()
}