import { cache } from 'react';
import prisma from '../../utils/prisma';
import { Prisma, chain_info } from '@prisma/client';
import { ChainType } from '@/consts/setting';

export type ChainInfo = Pick<
  chain_info,
  | 'name'
  | 'chain_id'
  | 'be_json_rpc_urls'
  | 'bech32'
  | 'chain_type'
  | 'latest_indexed_block'
  | 'denoms'
>;

const select: Prisma.chain_infoSelect = {
  name: true,
  chain_id: true,
  be_json_rpc_urls: true,
  bech32: true,
  chain_type: true,
  latest_indexed_block: true,
  denoms: true,
};

export const getChainInfos = cache(function (): Promise<ChainInfo[]> {
  return prisma.chain_info.findManyWithCache({
    select,
    cacheStrategy: { enabled: true },
  });
});

export const getChainNamesByChainIds = function (chainIds: string[]) {
  const where: Prisma.chain_infoWhereInput = {};
  if (chainIds.length) where.chain_id = { in: chainIds.sort() };
  return prisma.chain_info.findManyWithCache({
    select: { chain_id: true, name: true },
    cacheStrategy: { enabled: true },
    where,
  });
};

export const getEvmChainInfo = function () {
  return prisma.chain_info.findManyWithCache({
    select: { chain_id: true, name: true },
    where: { chain_type: ChainType.EVM },
    cacheStrategy: { enabled: true },
  });
};

export const getChainInfoByPrefix = function (prefix: string) {
  return prisma.chain_info.findManyWithCache({
    select: { chain_id: true, name: true },
    where: {
      OR: [
        { bech32: { path: ['addr'], equals: prefix } },
        { bech32: { path: ['val'], equals: prefix } },
      ],
    },
    cacheStrategy: { enabled: true },
  });
};

export const searchChainInfoByMultipleFields = function (searchValue: string) {
  const OR: Prisma.chain_infoWhereInput[] = [
    { chain_id: { contains: searchValue } },
    { name: { contains: searchValue } },
  ];
  if (/^\d+$/.test(searchValue))
    OR.push({ latest_indexed_block: { gte: parseInt(searchValue) } });
  return prisma.chain_info.findMany({
    select: { chain_id: true, name: true, latest_indexed_block: true },
    where: { OR },
  });
};
