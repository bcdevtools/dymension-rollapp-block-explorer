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
};

export type Transaction = Pick<
  transaction,
  'hash' | 'height' | 'epoch' | 'message_types' | 'tx_type' | 'action'
>;

function getTransactionsByHeightWhereCondition(
  chain_id: string,
  height: number | null
) {
  const where: Prisma.transactionWhereInput = {
    chain_id,
  };
  if (height) where.height = height;
  return where;
}

export const getTransactionsByHeight = async function (
  chain_id: string,
  height: number | null,
  paginationOptions: QueryPaginationOption = {}
): Promise<Transaction[]> {
  const where = getTransactionsByHeightWhereCondition(chain_id, height);

  return prisma.transaction.findManyWithCache({
    select,
    where,
    orderBy: [{ epoch: 'desc' }, { height: 'desc' }],
    ...paginationOptions,
    cacheStrategy: { enabled: true },
  });
};

export const countTransactionsByHeight = async function (
  chain_id: string,
  height: number | null
) {
  const where = getTransactionsByHeightWhereCondition(chain_id, height);
  return prisma.transaction.countWithCache({
    where,
    cacheStrategy: { enabled: true },
  });
};

export const getChainIdAndTxHashByTxHashes = async function (
  txHashes: string[]
) {
  return prisma.transaction.findManyWithCache({
    select: { chain_id: true, hash: true },
    where: { hash: { in: txHashes.sort() } }, // sort txHahses to make sure cache key is consistent
    cacheStrategy: { enabled: true },
  });
};
