import { getChainNameByChainId } from '@/services/db/chainInfo';
import { getRollappPathByName } from '@/utils/rollapp';
import { redirect } from 'next/navigation';

type ByChainIdProps = Readonly<{
  params: { chainId: string };
}>;

export default async function ByChainId({ params }: ByChainIdProps) {
  const chainInfo = await getChainNameByChainId(params.chainId);
  if (!chainInfo) throw new Error('RollApp not registered for Block Explorer');
  else redirect(`${getRollappPathByName(chainInfo.name)}`);
}
