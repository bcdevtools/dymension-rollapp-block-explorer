import { cache } from 'react';
import prisma from '../../utils/prisma';

export const getChainInfos = cache(function () {
  return prisma.chain_info.findMany();
});