export const enum Path {
  OVERVIEW = '/',
  BLOCKS = '/blocks',
  BLOCK = '/block',
  TRANSACTIONS = '/txs',
  TRANSACTION = '/tx',
  ADDRESS = '/address',
  NOT_FOUND = '/not-found',
}

export const BreadcrumbName = {
  [Path.OVERVIEW]: 'Overview',
  [Path.BLOCKS]: 'Blocks',
  [Path.BLOCK]: 'Blocks',
  [Path.TRANSACTIONS]: 'Transactions',
  [Path.TRANSACTION]: 'Transactions',
  [Path.ADDRESS]: 'Address',
  [Path.NOT_FOUND]: 'Not found',
};
