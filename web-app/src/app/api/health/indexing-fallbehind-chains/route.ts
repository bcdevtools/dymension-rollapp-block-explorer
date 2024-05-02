import prisma from '@/utils/prisma';

export async function GET() {
  const result =
    await prisma.$queryRaw`SELECT * FROM get_indexing_fallbehind_chains(4)`;

  return Response.json(result);
}
