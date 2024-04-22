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
      key: `getTransactionsByHeight-${chain_id}-${height}-${paginationOptions.take}-${paginationOptions.skip}`,
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
      key: `countTransactionsByHeight-${chain_id}-${height}`,
      revalidate: DEFAULT_CACHE_DURATION,
    },
  });
};

export const getChainIdAndTxHashByTxHashes = async function (
  txHashes: string[]
) {
  return prisma.transaction.findManyWithCache({
    select: { chain_id: true, hash: true },
    where: { hash: { in: txHashes } },
    cacheStrategy: {
      key: `getChainIdAndTxHashByTxHashes-${txHashes.sort()}`,
      revalidate: DEFAULT_CACHE_DURATION,
    },
  });
};
