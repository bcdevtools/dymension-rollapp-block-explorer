import { getRollAppInfoByRollappPath } from '@/services/chain.service';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import { CustomToolbar } from '@/components/client/commons/Layout/_Header';
import Layout from '@/components/client/commons/Layout';
import { SIDER_WIDTH } from '@/consts/theme';
import { redirect } from 'next/navigation';

type RollappLayoutProps = Readonly<{
  params: { rollappPath: string };
  children: React.ReactNode;
}>;

export async function generateMetadata({ params }: RollappLayoutProps) {
  const rollappInfo = await getRollAppInfoByRollappPath(params.rollappPath);

  return {
    title: `${(rollappInfo?.name || '').toUpperCase()} Block Explorer`,
    description: `Exploring RollApp ${(rollappInfo?.name || '').toUpperCase()} on Dymension`,
  };
}

export default async function RollappLayout({
  children,
  params,
}: RollappLayoutProps) {
  const rollappInfo = await getRollAppInfoByRollappPath(params.rollappPath);
  if (!rollappInfo) return redirect('/');
  return (
    <Layout>
      <Box
        width={{ xs: '100vw', md: `calc(100vw - ${SIDER_WIDTH}px)` }}
        component="main"
        flexGrow={1}>
        <CustomToolbar />
        <Container sx={{ py: 1 }}>{children}</Container>
      </Box>
    </Layout>
  );
}
