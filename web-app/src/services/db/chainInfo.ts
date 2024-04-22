import { cache } from 'react';
import prisma from '../../utils/prisma';
import { DEFAULT_CACHE_DURATION } from '@/consts/setting';
import { unstable_cache } from 'next/cache';

export const getChainInfos = cache(
  unstable_cache(
    function () {
      return prisma.chain_info.findMany();
    },
    ['getChainInfos'],
    { revalidate: DEFAULT_CACHE_DURATION }
  )
);
