export const enum Path {
  OVERVIEW = '/',
  BLOCKS = '/blocks',
  BLOCK = '/block',
  TRANSACTIONS = '/txs',
  TRANSACTION = '/tx',
  ADDRESS = '/address',
  VALIDATORS = '/governors',
  PROPOSALS = '/proposals',
  PROPOSAL = '/proposal',
}

export const BreadcrumbName = {
  [Path.OVERVIEW]: 'Overview',
  [Path.BLOCKS]: 'Blocks',
  [Path.BLOCK]: 'Blocks',
  [Path.TRANSACTIONS]: 'Transactions',
  [Path.TRANSACTION]: 'Transactions',
  [Path.ADDRESS]: 'Address',
  [Path.VALIDATORS]: 'Governors',
  [Path.PROPOSALS]: 'Proposals',
  [Path.PROPOSAL]: 'Proposal',
};
