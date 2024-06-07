import { DEFAULT_CACHE_DURATION } from '@/consts/setting';
import prisma from '@/utils/prisma';
import { cache } from '@/utils/cache';

export const dynamic = 'force-dynamic';

type IndexingFallbehindChains = Required<{ epoch_diff: number }>;

const getIndexingFallBehindChains: () => Promise<IndexingFallbehindChains[]> = cache(
  () => prisma.$queryRaw`SELECT * FROM get_indexing_fallbehind_chains(4)`,
  'get_indexing_fallbehind_chains',
  DEFAULT_CACHE_DURATION,
);

export async function GET() {
  const result = await getIndexingFallBehindChains();

  let status = 200;
  for (const r of result) {
    if (r.epoch_diff > 3610) {
      status = 530;
      break;
    }
    if (r.epoch_diff > 2400) {
      status = 503;
    }
  }

  return Response.json(result, { status });
}
