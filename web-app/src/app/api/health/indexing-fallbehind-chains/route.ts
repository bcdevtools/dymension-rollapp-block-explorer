import { DEFAULT_CACHE_DURATION } from '@/consts/setting';
import prisma from '@/utils/prisma';
import { cache } from '@/utils/cache';

type IndexingFallbehindChains = Required<{ epoch_diff: number }>;

const getIndexingFallBehindChains = cache(
  (): Promise<IndexingFallbehindChains[]> =>
    prisma.$queryRaw`SELECT * FROM get_indexing_fallbehind_chains(4)`,
  'get_indexing_fallbehind_chains',
  DEFAULT_CACHE_DURATION
);

// const getIndexingFallBehindChains = (): Promise<IndexingFallbehindChains[]> =>
//   prisma.$queryRaw`SELECT * FROM get_indexing_fallbehind_chains(4)`;

export async function GET() {
  const result = await getIndexingFallBehindChains();

  return Response.json(result, {
    status: result.some((r: any) => r.epoch_diff > 180) ? 503 : 200,
  });
}
