export const DEFAULT_DATE_TIME_FORMAT =
  process.env.NEXT_PUBLIC_DEFAULT_DATE_TIME_FORMAT || 'YYYY-MM-DD HH:mm:ss';

export const APP_NAME =
  process.env.NEXT_PUBLIC_APP_NAME || 'Rollapp Block Explorer';

const defaultPaginationSize = Number(
  process.env.NEXT_PUBLIC_DEFAULT_PAGINATION_SIZE
);
export const DEFAULT_PAGINATION_SIZE: number = !isNaN(defaultPaginationSize)
  ? defaultPaginationSize
  : 25;

const maxPaginationSize = Number(process.env.NEXT_PUBLIC_MAX_PAGINATION_SIZE);
export const MAX_PAGINATION_SIZE: number = !isNaN(maxPaginationSize)
  ? maxPaginationSize
  : 100;
