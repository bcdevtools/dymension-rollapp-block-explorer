import { QueryList } from '@/consts/dbResTypes';
import prisma from '../../utils/prisma';
import { Prisma, transaction } from '@prisma/client';

export const getTransactionsByHeight = async function (
  chain_id: string,
  height: number | null,
  paginationOptions?: { offset?: number; limit?: number }
): Promise<QueryList<transaction>> {
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

  const [data, total] = await prisma.$transaction([
    prisma.transaction.findMany(findOption),
    prisma.transaction.count({ where: findOption.where }),
  ]);

  return { total, data };
};
