'use client';

import { DetailItem } from '@/components/commons/DetailItem';
import useValidator from '@/hooks/useValidator';
import Grid from '@mui/material/Grid';
import { AddressPageTitle } from './AddressPageTitle';
import Card from '@/components/commons/Card';
import Link from '@/components/commons/Link';
import Divider from '@mui/material/Divider';
import { formatBlockchainAmount } from '@/utils/number';
import useDenomsMetadata from '@/hooks/useDenomsMetadata';
import { getAmount } from '@/utils/common';
import get from 'lodash/get';

type ValidatorProps = Readonly<{
  bech32Address: string;
  evmAddress: string | null;
  bondDenom: string;
}>;

export default function ValidatorDetail({ bech32Address, evmAddress, bondDenom }: ValidatorProps) {
  const [validator, validatorLoading] = useValidator(bech32Address);
  const [denomsMetadata, denomsMetadataLoading] = useDenomsMetadata();

  const bondDecimals = denomsMetadata[bondDenom] ? denomsMetadata[bondDenom].highestExponent : 0;
  const bondSymbol = denomsMetadata[bondDenom]?.symbol;

  const loading = validatorLoading || denomsMetadataLoading;
  return (
    <>
      <AddressPageTitle
        bech32Address={bech32Address}
        evmAddress={evmAddress}
        isValidator
        title={validator?.validator.description.moniker}
      />
      <Card>
        <Grid container spacing={1}>
          <DetailItem
            label="Website"
            value={
              validator?.validator.description.website ? (
                <Link href={validator.validator.description.website}>{validator.validator.description.website}</Link>
              ) : (
                '-'
              )
            }
            loading={loading}
          />

          <DetailItem label="Details" value={validator?.validator.description.details || '-'} loading={loading} />
          <Grid item xs={12} sx={{ my: 2 }}>
            <Divider />
          </Grid>
          <DetailItem
            label="Voting Power"
            value={formatBlockchainAmount(validator?.validator.tokens, bondDecimals, 0)}
            loading={loading}
          />
          <DetailItem
            label="Comissions"
            value={`${formatBlockchainAmount(validator?.validator.commission.commission_rates.rate, -2)}%`}
            loading={loading}
          />
          <Grid item xs={12} sx={{ my: 2 }}>
            <Divider />
          </Grid>
          <DetailItem
            label="Self Stake"
            value={`${formatBlockchainAmount(validator?.staking.staking[bech32Address], bondDecimals)} ${bondSymbol}`}
            loading={loading}
          />
          <DetailItem
            label="Rewards"
            value={`${formatBlockchainAmount(
              getAmount(get(validator, 'staking.rewards', '0')),
              bondDecimals,
            )} ${bondSymbol}`}
            loading={loading}
          />
          <DetailItem
            label="Governor Outstanding Rewards"
            value={`${formatBlockchainAmount(
              getAmount(get(validator, 'staking.validatorOutstandingRewards', '0')),
              bondDecimals,
            )} ${bondSymbol}`}
            loading={loading}
          />
          <DetailItem
            label="Governor Commission"
            value={`${formatBlockchainAmount(
              getAmount(get(validator, 'staking.validatorCommission', '0')),
              bondDecimals,
            )} ${bondSymbol}`}
            loading={loading}
          />
        </Grid>
      </Card>
    </>
  );

  return <></>;
}
