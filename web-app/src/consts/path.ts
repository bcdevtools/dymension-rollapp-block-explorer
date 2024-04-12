export const enum Path {
  OVERVIEW = '/',
  BLOCKS = '/blocks',
  TRANSACTIONS = '/txs',
  ADDRESS = '/address',
  NOT_FOUND = '/not-found',
}

export const BreadcrumbName = {
  [Path.OVERVIEW]: 'Overview',
  [Path.BLOCKS]: 'Blocks',
  [Path.TRANSACTIONS]: 'Transactions',
  [Path.ADDRESS]: 'Address',
  [Path.NOT_FOUND]: 'Not found',
};
