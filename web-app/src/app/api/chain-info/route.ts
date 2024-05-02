import { getChainNamesByChainIds } from '@/services/db/chainInfo';

export async function GET(
  request: Request,
  { params }: { params: { chainId: string } }
) {
  const { searchParams } = new URL(request.url);
  const chainIds = searchParams.getAll('chain-id');
  const result = await getChainNamesByChainIds(chainIds);

  return Response.json(result);
}
