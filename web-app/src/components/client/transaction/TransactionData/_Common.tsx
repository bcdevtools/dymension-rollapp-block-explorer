import Grid from '@mui/material/Grid';
import React from 'react';
import Typography from '@mui/material/Typography';
import { divideAmountByDecimals } from '@/utils/number';
import Big from 'big.js';
import { Erc20ContractInfo } from '@/consts/rpcResTypes';

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
    return divideAmountByDecimals(new Big(fromHexStringToBigInt(hexStr).toString(10)), 18).toString()
}

export function fromHexStringToEthereumGasPriceValue(hexStr: string) {
    return divideAmountByDecimals(new Big(fromHexStringToBigInt(hexStr).toString(10)), 9).toString()
}

function fromHexStringToBigInt(hexStr: string) {
    if (hexStr.length % 2 !== 0) {
        hexStr = '0x0' + hexStr.substring(2);
    }
    return BigInt(hexStr);
}

export interface Erc20TransferEvent {
    type: string;
    emiter: string;
    from: string;
    to: string;
    amount: string;
    rawAmount: boolean;
};

export function translateEvmLogIfPossible(topics: string[], data: string, emitter: string, contractAddressToErc20ContractInfo: Map<string, Erc20ContractInfo> | undefined) {
    if (topics.length === 3 
        && topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' 
        && isTopicEvmAddress(topics[1]) 
        && isTopicEvmAddress(topics[2])
        && data.length === 66) {
        const from = "0x" + topics[1].substring(26);
        const to = "0x" + topics[2].substring(26);
        const erc20ContractInfo = contractAddressToErc20ContractInfo?.get(emitter);
        const decimals = erc20ContractInfo?.decimals;
        return {
            type: 'Erc20TransferEvent',
            action: 'Transfer (ERC-20)',
            from: from,
            to: to,
            amount: erc20ContractInfo && decimals
                ? (BigInt(data) / BigInt(10 ** decimals)).toString(10)
                : data,
            rawAmount: !decimals,
        };
    }
    return null;
}

function isTopicEvmAddress(topic: string) {
    return topic.startsWith('0x000000000000000000000000');
}
