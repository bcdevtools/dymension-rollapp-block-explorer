import { DEFAULT_CACHE_DURATION } from '@/consts/setting';
import prisma from '@/utils/prisma';
import { cache } from '@/utils/cache';

export const dynamic = 'force-dynamic';

type IndexingFallbehindChains = Required<{ epoch_diff: number }>;

const getIndexingFallBehindChains = cache(
  (): Promise<IndexingFallbehindChains[]> => prisma.$queryRaw`SELECT * FROM get_indexing_fallbehind_chains(4)`,
  'get_indexing_fallbehind_chains',
  DEFAULT_CACHE_DURATION,
);

export async function GET() {
  const result = await getIndexingFallBehindChains();

  let status = 200;
  if (result.some((r: any) => r.epoch_diff > 1800)) {
    status = 530;
  } else if (result.some((r: any) => r.epoch_diff > 360)) {
    status = 503;
  }

  return Response.json(result, {
    status: status,
  });
}
