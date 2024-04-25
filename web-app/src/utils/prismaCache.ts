import { DEFAULT_CACHE_DURATION } from '@/consts/setting';
import { Prisma } from '@prisma/client';
import stringify from 'fast-json-stable-stringify';
import { unstable_cache } from 'next/cache';

type CustomCacheStrategy = {
  readonly cacheStrategy?: {
    enabled: boolean;
    key?: string;
    revalidate?: number | false;
    tags?: string[];
  };
};

type Operation =
  | 'aggregate'
  | 'count'
  | 'findFirst'
  | 'findFirstOrThrow'
  | 'findMany'
  | 'findUnique'
  | 'findUniqueOrThrow'
  | 'groupBy';

function queryWithCache<T, A, F extends Operation>(
  this: T,
  action: F,
  args?: Prisma.Exact<A, Prisma.Args<T, F> & CustomCacheStrategy> | undefined
): Prisma.PrismaPromise<Prisma.Result<T, A, F>> {
  const context = Prisma.getExtensionContext(this) as any;
  if (!args) return context[action](args);

  //@ts-ignore
  const { cacheStrategy, ...queryArgs } = args;

  if (!cacheStrategy || !cacheStrategy.enabled)
    return context[action](queryArgs);
  else {
    const { revalidate = DEFAULT_CACHE_DURATION, tags } = cacheStrategy;
    return unstable_cache(
      () => context[action](queryArgs),
      [
        cacheStrategy.key ||
          `${(this as any).name}-${action}-${stringify(queryArgs)}`,
      ],
      { revalidate, tags }
    )();
  }
}

export function withCache() {
  return {
    model: {
      $allModels: {
        findManyWithCache<T, A>(
          this: T,
          args?:
            | Prisma.Exact<A, Prisma.Args<T, 'findMany'> & CustomCacheStrategy>
            | undefined
        ): Prisma.PrismaPromise<Prisma.Result<T, A, 'findMany'>> {
          return queryWithCache.bind(this)(
            'findMany',
            args
          ) as Prisma.PrismaPromise<Prisma.Result<T, A, 'findMany'>>;
        },
        countWithCache<T, A>(
          this: T,
          args?:
            | Prisma.Exact<A, Prisma.Args<T, 'count'> & CustomCacheStrategy>
            | undefined
        ): Prisma.PrismaPromise<Prisma.Result<T, A, 'count'>> {
          return queryWithCache.bind(this)(
            'count',
            args
          ) as Prisma.PrismaPromise<Prisma.Result<T, A, 'count'>>;
        },
      },
    },
  };
}