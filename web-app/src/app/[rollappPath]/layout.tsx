import { rollapps } from '@/consts/rollapps';

type RollappLayoutProps = Readonly<{
  params: { rollappPath: string };
}>;

export async function generateMetadata({ params }: RollappLayoutProps) {
  const path = `/${params.rollappPath}`;
  const rollappData = rollapps.find(rollapp => rollapp.path === path);
  return {
    title: `${rollappData?.name} Block Explorer`,
    description: `${rollappData?.name} Block Explorer`,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
