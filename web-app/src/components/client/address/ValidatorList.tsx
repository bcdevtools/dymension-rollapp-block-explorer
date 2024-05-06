'use client';

import DataTable from '@/components/commons/DataTable';
import useValidators from '@/hooks/useValidators';
import AddressLink from './AddressLink';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { PAGE_PARAM_NAME, PAGE_SIZE_PARAM_NAME } from '@/consts/setting';
import { getPageAndPageSizeFromStringParam } from '@/utils/common';

export default function ValidatorList() {
  const [validators, loading] = useValidators();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const validatorAddresses = Object.keys(validators).sort(
    (a, b) => validators[b].votingPower - validators[a].votingPower
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

  const body = rowKeys.map(address => [
    <AddressLink key={address} address={address} showCopyButton={false} />,
    validators[address].votingPower,
  ]);

  return (
    <DataTable
      loading={loading}
      headers={['Address', 'Voting Power']}
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
