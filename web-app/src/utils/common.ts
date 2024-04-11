import { Path } from '@/consts/path';
import {
  DEFAULT_DATE_TIME_FORMAT,
  DEFAULT_PAGINATION_SIZE,
  MAX_PAGINATION_SIZE,
} from '@/consts/setting';
import dayjs from 'dayjs';
import { isAddress } from './address';

export type SearchParam = string | undefined | null;

export function getRollappPathFromPathname(pathname: string) {
  return pathname.match(/^\/[^\/]*/)![0];
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

export function getNewPathOnSearch(rollappPath: string, searchText: string) {
  searchText = searchText.trim();

  const searchTextAsDec = parseInt(searchText, 10);

  if (!isNaN(searchTextAsDec) && searchTextAsDec > 0)
    return `${rollappPath}/${Path.BLOCKS}/${searchTextAsDec}`;

  let searchTextAsHex = parseInt(searchText, 16);
  if (!isNaN(searchTextAsHex) && searchTextAsHex >= 0) {
    searchText = searchText.toLowerCase();
    if (!searchText.startsWith('0x')) searchText = `0x${searchText}`;

    return `${rollappPath}/${
      isAddress(searchText) ? Path.ADDRESS : Path.TRANSACTIONS
    }/${searchText}`;
  }
  throw new Error('Invalid search');
}
