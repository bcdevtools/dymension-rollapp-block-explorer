'use client';

import DataTable from '@/components/commons/DataTable';
import useValidators from '@/hooks/useValidators';
import AddressLink from './AddressLink';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { PAGE_PARAM_NAME, PAGE_SIZE_PARAM_NAME } from '@/consts/setting';
import { getPageAndPageSizeFromStringParam } from '@/utils/common';
import { compareNumberString, formatBlockchainAmount } from '@/utils/number';
import React, { useMemo } from 'react';
import Big from 'big.js';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function ValidatorList() {
  const [validators, loading] = useValidators();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const validatorAddresses = useMemo(
    () =>
      Object.keys(validators).sort((a, b) =>
        compareNumberString(validators[b].tokens, validators[a].tokens)
      ),
    [validators]
  );

  const totalTokens = useMemo(
    () =>
      Object.values(validators).reduce<Big>(
        (acc, v) => new Big(v.tokens).add(acc),
        new Big(0)
      ),
    [validators]
  );

  const [pageSize, page] = getPageAndPageSizeFromStringParam(
    searchParams.get(PAGE_SIZE_PARAM_NAME),
    searchParams.get(PAGE_PARAM_NAME),
    validatorAddresses.length
  );

  const rowKeys = validatorAddresses.slice(
    page * pageSize,
    (page + 1) * pageSize
  );

  const body = rowKeys.map(address => {
    const vpPercent = new Big(validators[address].tokens)
      .div(totalTokens)
      .times(100);
    return [
      <AddressLink
        key={address}
        address={validators[address].valAddress}
        display={`${validators[address].moniker}`}
        showCopyButton={false}
      />,
      <Box key={`${address}_power`}>
        {formatBlockchainAmount(
          validators[address].tokens,
          validators[address].tokensDecimals,
          0
        )}{' '}
        <Typography
          display="inline"
          fontSize="0.7rem"
          color={
            vpPercent.gt(33) ? 'red' : vpPercent.gt(10) ? 'orange' : 'grey'
          }>
          {formatBlockchainAmount(vpPercent, 0, 4)}%
        </Typography>
      </Box>,
      `${formatBlockchainAmount(validators[address].commission, -2)}%`,
    ];
  });

  return (
    <DataTable
      loading={loading}
      headers={['Governor', 'Voting Power', 'Commission']}
      rowKeys={validatorAddresses}
      body={body}
      total={validatorAddresses.length}
      page={page}
      pageSize={pageSize}
      onPageChange={newPage => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set(PAGE_PARAM_NAME, newPage.toString());
        router.push(`${pathname}?${newSearchParams.toString()}`, {
          scroll: false,
        });
      }}
      onRowsPerPageChange={newPageSize => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set(PAGE_SIZE_PARAM_NAME, newPageSize);
        router.push(`${pathname}?${newSearchParams.toString()}`, {
          scroll: false,
        });
      }}
    />
  );
}
