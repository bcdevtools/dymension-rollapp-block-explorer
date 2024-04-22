import { PrismaClient } from '@prisma/client';

// type CacheArgs = {
//   cacheOptions?: {
//     key: string;
//     revalidate?: number | false;
//     tags?: string[];
//   };
// };

(BigInt.prototype as any).toJSON = function () {
  const int = Number.parseInt(this.toString());
  return int ?? this.toString();
};

const isProduction = process.env.NODE_ENV === 'production';

const prismaClientSingleton = () => {
  const prisma = new PrismaClient({
    log: !isProduction
      ? [
          {
            emit: 'event',
            level: 'query',
          },
          'info',
        ]
      : [],
  });
  if (!isProduction) {
    prisma.$on('query', e => {
      console.log('Query: ' + e.query);
      console.log('Duration: ' + e.duration + 'ms');
    });
  }
  return prisma;
  // return prisma.$extends({
  //   model: {
  //     $allModels: {
  //       async findManyAndCache<T>(
  //         this: T,
  //         { cacheOptions, ...args }: Prisma.Args<T, 'findMany'> & CacheArgs
  //       ) {
  //         const context = Prisma.getExtensionContext(this);
  //         const { revalidate, tags } = cacheOptions;
  //         if (!cacheOptions) (context as any).findMany(args);
  //         const result = await unstable_cache(
  //           () => (context as any).findMany(args),
  //           [cacheOptions.key],
  //           { revalidate, tags }
  //         )();
  //         return result;
  //       },
  //     },
  //   },
  // });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (!isProduction) globalThis.prismaGlobal = prisma;
