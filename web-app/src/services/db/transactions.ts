import { QueryPaginationOption } from '@/utils/db';
import prisma from '../../utils/prisma';
import { Prisma } from '@prisma/client';
import { DEFAULT_CACHE_DURATION } from '@/consts/setting';

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
) {
  const where = getTransactionsByHeightWhereCondition(chain_id, height);

  return prisma.transaction.findManyWithCache({
    where,
    orderBy: [{ epoch: 'desc' }, { height: 'desc' }],
    ...paginationOptions,
    cacheStrategy: {
      enabled: true,
      revalidate: DEFAULT_CACHE_DURATION,
    },
  });
};

export const countTransactionsByHeight = async function (
  chain_id: string,
  height: number | null
) {
  const where = getTransactionsByHeightWhereCondition(chain_id, height);
  return prisma.transaction.countWithCache({
    where,
    cacheStrategy: {
      enabled: true,
      revalidate: DEFAULT_CACHE_DURATION,
    },
  });
};

export const getChainIdAndTxHashByTxHashes = async function (
  txHashes: string[]
) {
  return prisma.transaction.findManyWithCache({
    select: { chain_id: true, hash: true },
    where: { hash: { in: txHashes.sort() } }, // sort txHahses to make sure cache key is consistent
    cacheStrategy: {
      enabled: true,
      revalidate: DEFAULT_CACHE_DURATION,
    },
  });
};
