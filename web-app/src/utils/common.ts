import {
  DEFAULT_DATE_TIME_FORMAT,
  DEFAULT_PAGINATION_SIZE,
  MAX_PAGINATION_SIZE,
} from '@/consts/setting';
import dayjs from 'dayjs';

export type SearchParam = string | string[] | undefined;

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

export function getStringParamAsArrayNumber(param: SearchParam): number[] {
  if (!param) return [];
  const numbers = Array.isArray(param)
    ? param.map(parseInt)
    : [parseInt(param)];
  return numbers.filter(v => !isNaN(v));
}

export function getStringParamAsNumber(param: SearchParam): number {
  return param ? parseInt(param.toString()) : NaN;
}

export function getValidPageSize(pageSize: number) {
  if (isNaN(pageSize) || pageSize <= 0) return DEFAULT_PAGINATION_SIZE;
  return Math.min(pageSize, MAX_PAGINATION_SIZE);
}

export function getOffsetFromPageAndPageSize(page: number, pageSize: number) {
  if (isNaN(page) || page < 0) return 0;
  return page * pageSize;
}
