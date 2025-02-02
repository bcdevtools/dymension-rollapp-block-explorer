import { DenomsMetadata } from '@/consts/rpcResTypes';
import { DEFAULT_PAGINATION_SIZE, MAX_PAGINATION_SIZE } from '@/consts/setting';
import { formatBlockchainAmount } from './number';

export type SearchParam = string | undefined | null;

export function getRollappPathFromPathname(pathname: string) {
  //eslint-disable-next-line
  return pathname.match(/^\/[^\/]*/)![0];
}

export function isNotFoundPath(pathname: string) {
  //eslint-disable-next-line
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

export function getValidPage(page: number, pageSize: number, total?: number) {
  if (isNaN(page) || page <= 0) return 0;
  if (total === undefined) return page;
  return Math.min(total === 0 ? 0 : Math.ceil(total / pageSize) - 1, page);
}

export function getPageAndPageSizeFromStringParam(
  pageSizeParam: SearchParam,
  pageParam: SearchParam,
  total?: number,
): [number, number] {
  const pageSize = getValidPageSize(getNumberFromStringParam(pageSizeParam));
  const page = getValidPage(getNumberFromStringParam(pageParam), pageSize, total);

  return [pageSize, page];
}

export function getOffsetFromPageAndPageSize(page: number, pageSize: number) {
  if (isNaN(page) || page < 0) return 0;
  return page * pageSize;
}

export function isAbortException(e: Error) {
  return e instanceof DOMException && e.name === 'AbortError';
}

export function getAmount(rpcAmountStr: string) {
  const matched = rpcAmountStr.match(/^\d+/);
  return matched ? matched[0] : '0';
}

export function getDenom(rpcAmountStr: string) {
  const matched = rpcAmountStr.match(/[a-z]+$/);
  return matched ? matched[0] : null;
}
function addSpaceBetweenWords(word: string) {
  return word.replace(/\B(?=[A-Z])/g, ' ');
}

export function getPrototypeFromTypeUrl(typeUrl: string) {
  //eslint-disable-next-line
  const matched = typeUrl.match(/(?<=\.)[^\.]+$/);
  if (!matched) return addSpaceBetweenWords(typeUrl);
  else return addSpaceBetweenWords(matched[0]);
}

export function formatRpcAmount(amountStr: string, denomsMetadata: DenomsMetadata) {
  const amount = getAmount(amountStr);
  const denom = getDenom(amountStr);

  if (!denom || !denomsMetadata[denom]) {
    const denomDisplay = denom ? ` ${denom.toUpperCase()}` : '';
    return `${formatBlockchainAmount(amount)}${denomDisplay}`;
  }
  const rewardDenomMetadata = denomsMetadata[denom];
  return `${formatBlockchainAmount(amount, rewardDenomMetadata.highestExponent)} ${rewardDenomMetadata.symbol}`;
}

export function isBlockNo(valueToCheck: string) {
  return /^\d+$|^(0x)?[\da-fA-F]+$/.test(valueToCheck);
}
