import { QueryPaginationOption } from '@/utils/db';
import prisma from '../../utils/prisma';
import { Prisma } from '@prisma/client';

function getTransactionsWhereCondition(
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
  const where = getTransactionsWhereCondition(chain_id, height);

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
  const where = getTransactionsWhereCondition(chain_id, height);
  return prisma.transaction.count({ where });
};
