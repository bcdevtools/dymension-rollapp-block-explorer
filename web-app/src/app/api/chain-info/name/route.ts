import { getChainNamesByChainIds } from '@/services/db/chainInfo';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chainIds = searchParams.getAll('chain-id');
  const chainInfos = await getChainNamesByChainIds(chainIds);

  const result = chainInfos.reduce<{ [chainId: string]: string }>(
    (final, chainInfo) => {
      final[chainInfo.chain_id] = chainInfo.name;
      return final;
    },
    {}
  );

  return Response.json(result);
}
