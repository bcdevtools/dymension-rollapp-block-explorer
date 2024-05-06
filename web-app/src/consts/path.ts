export const enum Path {
  OVERVIEW = '/',
  BLOCKS = '/blocks',
  BLOCK = '/block',
  TRANSACTIONS = '/txs',
  TRANSACTION = '/tx',
  ADDRESS = '/address',
  VALIDATORS = '/validators',
}

export const BreadcrumbName = {
  [Path.OVERVIEW]: 'Overview',
  [Path.BLOCKS]: 'Blocks',
  [Path.BLOCK]: 'Blocks',
  [Path.TRANSACTIONS]: 'Transactions',
  [Path.TRANSACTION]: 'Transactions',
  [Path.ADDRESS]: 'Address',
};
