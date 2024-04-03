import { rollapps } from '@/consts/rollapps';

export function getChainDataFromPathname(pathname: string) {
  const rollappPath = pathname.match(/^\/[^\/]*/)![0];
  return rollapps.find(rollapp => rollapp.path === rollappPath);
}

export function getNewPathOnMenuClick(pathname: string, path: string) {
  const slittedPath = pathname.split('/');
  return `${slittedPath[1] ? '/' : ''}${slittedPath[1]}${path}`;
}
