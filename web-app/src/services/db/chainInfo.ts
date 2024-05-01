import { cache } from 'react';
import prisma from '../../utils/prisma';
import { Prisma } from '@prisma/client';

export interface ChainInfo {
  name: string;
  chain_id: string;
  be_json_rpc_urls: string[];
  bech32: Prisma.JsonValue;
  chain_type: string;
  latest_indexed_block: bigint;
}

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
