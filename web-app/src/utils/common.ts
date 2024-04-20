import { Path } from '@/consts/path';
import {
  ChainType,
  DEFAULT_PAGINATION_SIZE,
  MAX_PAGINATION_SIZE,
} from '@/consts/setting';
import {
  RollappAddress,
  isCosmosAddress,
  isEvmAddress,
  isTxHash,
} from './address';
import { RollappInfo } from './rollapp';
import { JsonObject } from '@prisma/client/runtime/library';

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

export function handleSearch(
  rollappInfo: RollappInfo,
  searchText: string,
  cb: (newPath: string) => void
) {
  const { path: rollappPath } = rollappInfo;
  searchText = searchText.trim();

  if (!searchText) return;

  if (/^\d+$/.test(searchText))
    return cb(`${rollappPath}${Path.BLOCKS}/${searchText}`);

  if (rollappInfo.chain_type === ChainType.EVM && isEvmAddress(searchText))
    return cb(`${rollappPath}${Path.ADDRESS}/${searchText}`);

  const searchTextInLowerCase = searchText.toLowerCase();
  if (isCosmosAddress(searchTextInLowerCase)) {
    try {
      RollappAddress.fromBech32(
        searchTextInLowerCase,
        (rollappInfo.bech32! as JsonObject).addr as string
      );
      return cb(`${rollappPath}${Path.ADDRESS}/${searchText}`);
    } catch (e) {
      return cb(`${rollappPath}${Path.NOT_FOUND}`);
    }
  }

  if (isTxHash(searchText))
    return cb(`${rollappPath}${Path.TRANSACTIONS}/${searchText}`);

  return cb(`${rollappPath}${Path.NOT_FOUND}`);
}
