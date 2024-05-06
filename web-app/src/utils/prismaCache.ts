import { DEFAULT_CACHE_DURATION } from '@/consts/setting';
import { Prisma } from '@prisma/client';
import { unstable_cache } from 'next/cache';

type CustomCacheStrategy = {
  readonly cacheStrategy?: {
    enabled: boolean;
    key?: string;
    revalidate?: number | false;
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
  args?: Prisma.Exact<A, Prisma.Args<T, F> & CustomCacheStrategy>
): Prisma.PrismaPromise<Prisma.Result<T, A, F>> {
  const context = Prisma.getExtensionContext(this) as any;
  if (!args) return context[action]();

  //@ts-ignore
  const { cacheStrategy, ...queryArgs } = args;

  if (!cacheStrategy || /*!cacheStrategy.enabled*/ true) {
    return context[action](queryArgs);
  } else {
    const { revalidate = DEFAULT_CACHE_DURATION } = cacheStrategy;
    return unstable_cache(
      actionQuery => {
        const context = Prisma.getExtensionContext(this) as any;
        return context[action](actionQuery);
      },
      cacheStrategy.key
        ? [cacheStrategy.key]
        : ['prisma', (this as any).name, action],
      { revalidate, tags: ['db'] }
    )(queryArgs);
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
        findUniqueWithCache<T, A>(
          this: T,
          args: Prisma.Exact<
            A,
            Prisma.Args<T, 'findUnique'> & CustomCacheStrategy
          >
        ): Prisma.PrismaPromise<Prisma.Result<T, A, 'findUnique'>> {
          return queryWithCache.bind(this)(
            'findUnique',
            args
          ) as Prisma.PrismaPromise<Prisma.Result<T, A, 'findUnique'>>;
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
