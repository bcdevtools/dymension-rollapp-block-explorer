import { DEFAULT_PAGINATION_SIZE, MAX_PAGINATION_SIZE } from '@/consts/setting';

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

export function isNullOrUndefined(value: any) {
  return value === undefined || value === null;
}

export function getNumberFromStringParam(param: SearchParam): number {
  if (isNullOrUndefined(param) || !/^\d+$/.test(param!)) return NaN;
  return parseInt(param!);
}

export function getValidPageSize(pageSize: number) {
  if (isNaN(pageSize) || pageSize == 0) return DEFAULT_PAGINATION_SIZE;
  return Math.min(pageSize, MAX_PAGINATION_SIZE);
}

export function getValidPage(page: number, pageSize: number, total: number) {
  if (isNaN(page) || page <= 0) return 0;
  return Math.min(total === 0 ? 0 : Math.ceil(total / pageSize) - 1, page);
}

export function getPageAndPageSizeFromStringParam(
  pageSizeParam: SearchParam,
  pageParam: SearchParam,
  total: number
): [number, number] {
  const pageSize = getValidPageSize(getNumberFromStringParam(pageSizeParam));
  const page = getValidPage(
    getNumberFromStringParam(pageParam),
    pageSize,
    total
  );

  return [pageSize, page];
}

export function getOffsetFromPageAndPageSize(page: number, pageSize: number) {
  if (isNaN(page) || page < 0) return 0;
  return page * pageSize;
}

export function isAbortException(e: Error) {
  return e instanceof DOMException && e.name === 'AbortError';
}
