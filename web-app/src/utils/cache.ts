import { DEFAULT_CACHE_DURATION } from '@/consts/setting';
import NodeCache, { Key } from 'node-cache';
import stringify from 'fast-json-stable-stringify';

const nodeCache = new NodeCache({
  stdTTL: DEFAULT_CACHE_DURATION,
  useClones: false,
});

export function cache(funcToCache: Function, key: Key, revalidateInSecond?: number): any {
  return async function (...args: any[]) {
    const cacheKey = [key, stringify(args)].join();
    const value = nodeCache.get(cacheKey);
    if (value) return value;

    const result = await funcToCache(...args);
    nodeCache.set(cacheKey, result, revalidateInSecond || DEFAULT_CACHE_DURATION);
    return result;
  };
}
