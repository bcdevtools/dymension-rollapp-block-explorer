import { QueryPaginationOption } from '@/utils/db';
import prisma from '../../utils/prisma';
import { Prisma } from '@prisma/client';

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

  return prisma.transaction.findMany({
    where,
    orderBy: [{ epoch: 'desc' }, { height: 'desc' }],
    ...paginationOptions,
  });
};

export const countTransactionsByHeight = async function (
  chain_id: string,
  height: number | null
) {
  const where = getTransactionsByHeightWhereCondition(chain_id, height);
  return prisma.transaction.count({ where });
};

export const getChainIdAndTxHashByTxHashes = async function (
  txHashes: string[]
) {
  return prisma.transaction.findMany({
    select: { chain_id: true, hash: true },
    where: { hash: { in: txHashes } },
  });
};
