import { QueryPaginationOption } from '@/utils/db';
import prisma from '../../utils/prisma';
import { Prisma, transaction } from '@prisma/client';

const select: Prisma.transactionSelect = {
  hash: true,
  height: true,
  epoch: true,
  message_types: true,
  tx_type: true,
  action: true,
  value: true,
};

export type Transaction = Pick<
  transaction,
  'hash' | 'height' | 'epoch' | 'message_types' | 'tx_type' | 'action' | 'value'
>;

export const getTransactions = async function (
  chain_id: string,
  paginationOptions: QueryPaginationOption = {}
): Promise<Transaction[]> {
  return prisma.transaction.findManyWithCache({
    select,
    where: { chain_id },
    orderBy: [{ epoch: 'desc' }, { height: 'desc' }],
    ...paginationOptions,
    cacheStrategy: { enabled: true },
  });
};

export const countTransactions = async function (chain_id: string) {
  return prisma.transaction.countWithCache({
    where: { chain_id },
    cacheStrategy: { enabled: true },
  });
};

export const getChainIdAndTxHashByTxHashes = async function (
  txHashes: string[]
) {
  return prisma.transaction.findMany({
    select: { chain_id: true, hash: true },
    where: { hash: { in: txHashes.sort() } },
  });
};

export const getTxHashAndChainInfoByTxHashes = async function (
  txHashes: string[]
) {
  return prisma.transaction.findMany({
    select: {
      chain_info: { select: { name: true, chain_id: true } },
      hash: true,
    },
    where: { hash: { in: txHashes } },
  });
};
