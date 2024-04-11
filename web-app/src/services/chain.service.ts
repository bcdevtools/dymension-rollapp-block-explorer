import { getRollappInfoByPath } from '@/utils/rollapp';
import { getChainInfos } from './db/chainInfo';
import React from 'react';

export const getRollAppInfoByRollappPath = React.cache(async function (
  rollappPath: string
) {
  const chainInfos = await getChainInfos();
  return getRollappInfoByPath(chainInfos, `/${rollappPath}`);
});
