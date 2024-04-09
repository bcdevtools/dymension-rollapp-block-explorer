import { getRollAppInfoByRollappPath } from '@/services/chain.service';

type RollappLayoutProps = Readonly<{
  params: { rollappPath: string };
  children: React.ReactNode;
}>;

export async function generateMetadata({ params }: RollappLayoutProps) {
  const rollappInfo = await getRollAppInfoByRollappPath(params.rollappPath);

  return {
    title: `${rollappInfo?.name} Block Explorer`,
    description: `${rollappInfo?.name} Block Explorer`,
  };
}

export default async function RootLayout({ children }: RollappLayoutProps) {
  return children;
}
