import { cache } from 'react';
import prisma from '../../utils/prisma';
import { Prisma, chain_info } from '@prisma/client';

// export interface ChainInfo {
//   name: string;
//   chain_id: string;
//   be_json_rpc_urls: string[];
//   bech32: Prisma.JsonValue;
//   chain_type: string;
//   latest_indexed_block: bigint;
// }

export type ChainInfo = Pick<
  chain_info,
  | 'name'
  | 'chain_id'
  | 'be_json_rpc_urls'
  | 'bech32'
  | 'chain_type'
  | 'latest_indexed_block'
>;

const select: Prisma.chain_infoSelect = {
  name: true,
  chain_id: true,
  be_json_rpc_urls: true,
  bech32: true,
  chain_type: true,
  latest_indexed_block: true,
};

export const getChainInfos = cache(function (): Promise<ChainInfo[]> {
  return prisma.chain_info.findManyWithCache({
    select,
    cacheStrategy: { enabled: true },
  });
});

export const getChainNamesByChainIds = function (chainIds: string[]) {
  return prisma.chain_info.findManyWithCache({
    select: { chain_id: true, name: true },
    where: { chain_id: { in: chainIds } },
    cacheStrategy: { enabled: true },
  });
};
