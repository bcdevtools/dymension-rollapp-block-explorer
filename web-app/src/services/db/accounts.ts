import { Prisma } from '@prisma/client';
import prisma from '../../utils/prisma';
import { QueryPaginationOption } from '@/utils/db';

export type AccountTransactionFilterOption = Partial<{
  signer: boolean;
  erc20: boolean;
  nft: boolean;
}>;

function getAccountTransactionsWhereCondition(
  chain_id: string,
  bech32_address: string,
  options: AccountTransactionFilterOption = {}
) {
  const where: Prisma.ref_account_to_recent_txWhereInput = {
    chain_id,
    bech32_address,
  };
  if (options.signer !== undefined) where.signer = options.signer;
  if (options.erc20 !== undefined) where.erc20 = options.erc20;
  if (options.nft !== undefined) where.nft = options.nft;
  return where;
}

export const countAccountTransactions = async function (
  chain_id: string,
  bech32_address: string,
  options: AccountTransactionFilterOption = {}
) {
  const where = getAccountTransactionsWhereCondition(
    chain_id,
    bech32_address,
    options
  );

  return prisma.ref_account_to_recent_tx.count({ where });
};

export const getAccountTransactions = function (
  chain_id: string,
  bech32_address: string,
  options: AccountTransactionFilterOption = {},
  paginationOptions: QueryPaginationOption = {}
) {
  const where = getAccountTransactionsWhereCondition(
    chain_id,
    bech32_address,
    options
  );

  return prisma.ref_account_to_recent_tx.findMany({
    where,
    include: { recent_accounts_transaction: true },
    orderBy: { height: 'desc' },
    ...paginationOptions,
  });
};
