import { getChainInfos } from '@/services/db/chainInfo';
import { getRollappInfoByPath } from '@/utils/rollappInfo';

type RollappLayoutProps = Readonly<{
  params: { rollappPath: string };
  children: React.ReactNode;
}>;

export async function generateMetadata({ params }: RollappLayoutProps) {
  const chainInfos = await getChainInfos();
  const rollappInfo = getRollappInfoByPath(
    chainInfos,
    `/${params.rollappPath}`
  );
  return {
    title: `${rollappInfo?.name} Block Explorer`,
    description: `${rollappInfo?.name} Block Explorer`,
  };
}

export default async function RootLayout({ children }: RollappLayoutProps) {
  return children;
}
