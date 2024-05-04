import { Prisma, account, ref_account_to_recent_tx } from '@prisma/client';
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
    cacheStrategy: { enabled: false },
  });
};

const select: Prisma.ref_account_to_recent_txSelect = {
  recent_accounts_transaction: {
    select: {
      hash: true,
      height: true,
      epoch: true,
      message_types: true,
      action: true,
    },
  },
};

export type RefAccountToRecentTx = Pick<
  Prisma.ref_account_to_recent_txGetPayload<{
    select: {
      recent_accounts_transaction: {
        select: {
          hash: true;
          height: true;
          epoch: true;
          message_types: true;
          action: true;
        };
      };
    };
  }>,
  'recent_accounts_transaction'
>;

export const getAccountTransactions = function (
  chain_id: string,
  bech32_address: string,
  options: AccountTransactionFilterOption = {},
  paginationOptions: QueryPaginationOption = {}
): Promise<RefAccountToRecentTx[]> {
  const where = getAccountTransactionsWhereCondition(
    chain_id,
    bech32_address,
    options
  );

  return prisma.ref_account_to_recent_tx.findManyWithCache({
    select,
    where,
    orderBy: { height: 'desc' },
    ...paginationOptions,
    cacheStrategy: { enabled: false },
  });
};

export type Account = Pick<
  account,
  | 'chain_id'
  | 'bech32_address'
  | 'balance_on_erc20_contracts'
  | 'balance_on_nft_contracts'
>;

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
    cacheStrategy: { enabled: false },
  });
};
