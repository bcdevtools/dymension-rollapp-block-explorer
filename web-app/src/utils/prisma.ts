import { PrismaClient } from '@prisma/client';
import { withCache } from './prismaCache';

(BigInt.prototype as any).toJSON = function () {
  const int = Number.parseInt(this.toString());
  return int ?? this.toString();
};

const isProduction = process.env.NODE_ENV === 'production';

const prismaClientSingleton = () => {
  const prisma = new PrismaClient({
    log: !isProduction ? [{ emit: 'event', level: 'query' }, 'info'] : [],
  });
  if (!isProduction) {
    prisma.$on('query', e => {
      console.log('Query: ' + e.query);
      console.log('Duration: ' + e.duration + 'ms');
    });
  }
  return prisma.$extends(withCache());
};

declare global {
  // eslint-disable-next-line
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (!isProduction) globalThis.prismaGlobal = prisma;
