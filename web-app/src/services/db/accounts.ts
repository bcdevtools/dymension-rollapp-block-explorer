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

  return prisma.ref_account_to_recent_tx.countWithCache({
    where,
    cacheStrategy: { enabled: true },
  });
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

  return prisma.ref_account_to_recent_tx.findManyWithCache({
    where,
    include: { recent_accounts_transaction: true },
    orderBy: { height: 'desc' },
    ...paginationOptions,
    cacheStrategy: { enabled: true },
  });
};

export type Account = {
  chain_id: string;
  bech32_address: string;
  balance_on_erc20_contracts: string[];
  balance_on_nft_contracts: string[];
};

export const getAccount = function (
  chain_id: string,
  bech32_address: string
): Promise<Account | null> {
  return prisma.account.findUniqueWithCache({
    select: {
      chain_id: true,
      bech32_address: true,
      balance_on_erc20_contracts: true,
      balance_on_nft_contracts: true,
    },
    where: { chain_id_bech32_address: { chain_id, bech32_address } },
    cacheStrategy: { enabled: true },
  });
};
