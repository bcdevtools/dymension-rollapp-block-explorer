import { Prisma } from '@prisma/client';
import { unstable_cache } from 'next/cache';

type CustomCacheStrategy = {
  readonly cacheStrategy?: {
    key: string;
    revalidate?: number | false;
    tags?: string[];
  };
};

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
          const context = Prisma.getExtensionContext(this) as any;
          if (!args) return context.findMany(args);

          //@ts-ignore
          const { cacheStrategy, ...queryArgs } = args;

          if (!cacheStrategy) return context.findMany(queryArgs);
          else
            return unstable_cache(
              () => context.findMany(queryArgs),
              [cacheStrategy.key],
              { revalidate: cacheStrategy.revalidate, tags: cacheStrategy.tags }
            )();
        },
        countWithCache<T, A>(
          this: T,
          args?:
            | Prisma.Exact<A, Prisma.Args<T, 'count'> & CustomCacheStrategy>
            | undefined
        ): Prisma.PrismaPromise<Prisma.Result<T, A, 'count'>> {
          const context = Prisma.getExtensionContext(this) as any;
          if (!args) return context.count(args);

          //@ts-ignore
          const { cacheStrategy, ...queryArgs } = args;

          if (!cacheStrategy) return context.count(queryArgs);
          else
            return unstable_cache(
              () => context.count(queryArgs),
              [cacheStrategy.key],
              { revalidate: cacheStrategy.revalidate, tags: cacheStrategy.tags }
            )();
        },
      },
    },
  };
}
