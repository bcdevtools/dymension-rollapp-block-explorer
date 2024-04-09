import prisma from '../../utils/prisma';
import { Prisma } from '@prisma/client';

export const getTransactionsByHeight = async function (
  chain_id: string,
  height: number | null,
  paginationOptions?: { offset?: number; limit?: number }
) {
  const findOption: Prisma.transactionFindManyArgs = {
    where: { chain_id },
    orderBy: { height: 'desc' },
  };
  if (height) {
    findOption.where!.height = height;
  }

  if (paginationOptions) {
    if (paginationOptions.offset) {
      findOption.skip = paginationOptions.offset;
    }
    if (paginationOptions.limit) {
      findOption.take = paginationOptions.limit;
    }
  }

  return prisma.transaction.findMany(findOption);
};

export const countTransactionsByHeight = async function (
  chain_id: string,
  height: number | null
) {
  const findOption: Prisma.transactionCountArgs = {
    where: { chain_id },
  };
  if (height) {
    findOption.where!.height = height;
  }
  return prisma.transaction.count(findOption);
};
