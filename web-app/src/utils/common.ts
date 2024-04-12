import { Path } from '@/consts/path';
import {
  DEFAULT_DATE_TIME_FORMAT,
  DEFAULT_PAGINATION_SIZE,
  MAX_PAGINATION_SIZE,
} from '@/consts/setting';
import dayjs from 'dayjs';

export type SearchParam = string | undefined | null;

export function getRollappPathFromPathname(pathname: string) {
  return pathname.match(/^\/[^\/]*/)![0];
}

export function isNotFoundPath(pathname: string) {
  return /(?<=^\/[^\/]*\/)not-found$/.test(pathname);
}

export function getNewPathByRollapp(pathname: string, newPath: string) {
  const slittedPath = pathname.split('/');
  return `${slittedPath[1] ? '/' : ''}${slittedPath[1]}${newPath}`;
}

export function formatUnixTime(unixTime: number) {
  return dayjs.unix(unixTime).format(DEFAULT_DATE_TIME_FORMAT);
}

export function getStringParamAsNumber(param: SearchParam): number {
  return param ? parseInt(param) : NaN;
}

export function getValidPageSize(pageSize: number) {
  if (isNaN(pageSize) || pageSize <= 0) return DEFAULT_PAGINATION_SIZE;
  return Math.min(pageSize, MAX_PAGINATION_SIZE);
}

export function getValidPage(page: number, pageSize: number, total: number) {
  if (isNaN(page) || page <= 0) return 0;
  return Math.min(total === 0 ? 0 : Math.ceil(total / pageSize) - 1, page);
}

export function getOffsetFromPageAndPageSize(page: number, pageSize: number) {
  if (isNaN(page) || page < 0) return 0;
  return page * pageSize;
}

export function formatNumberString(value: number) {
  return value.toLocaleString();
}

export function handleSearch(
  rollappPath: string,
  searchText: string,
  cb: (newPath: string) => void
) {
  searchText = searchText.trim();

  if (!searchText) return;

  if (/^\d+$/.test(searchText))
    return cb(`${rollappPath}/${Path.BLOCKS}/${searchText}`);

  if (
    /^(0x)?[\da-fA-F]{40}$/.test(searchText) ||
    /^[a-z]+1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{38,}$/.test(searchText)
  )
    return cb(`${rollappPath}/${Path.ADDRESS}/${searchText}`);

  if (/^(0x)?[\da-fA-F]{64}$/.test(searchText))
    return cb(`${rollappPath}/${Path.TRANSACTIONS}/${searchText}`);

  return cb(`${rollappPath}/${Path.NOT_FOUND}`);
}
