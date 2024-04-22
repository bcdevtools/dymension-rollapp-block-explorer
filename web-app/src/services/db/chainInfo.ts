import { cache } from 'react';
import prisma from '../../utils/prisma';
import { DEFAULT_CACHE_DURATION } from '@/consts/setting';

export const getChainInfos = cache(function () {
  return prisma.chain_info.findManyWithCache({
    cacheStrategy: { key: 'getChainInfos', revalidate: DEFAULT_CACHE_DURATION },
  });
});
