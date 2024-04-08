import dayjs from 'dayjs';

export function getRollappPathFromPathname(pathname: string) {
  return pathname.match(/^\/[^\/]*/)![0];
}

export function getNewPathByRollapp(pathname: string, newPath: string) {
  const slittedPath = pathname.split('/');
  return `${slittedPath[1] ? '/' : ''}${slittedPath[1]}${newPath}`;
}

export function formatUnixTime(unixTime: number) {
  return dayjs.unix(unixTime).format('YYYY-MM-DD HH:mm:ss');
}
