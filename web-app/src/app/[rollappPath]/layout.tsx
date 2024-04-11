import { getRollAppInfoByRollappPath } from '@/services/chain.service';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import PageBreadcrumb from '@/components/commons/PageBreadcrumb';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import { CustomToolbar } from '@/components/client/commons/Layout/_Header';
import Layout from '@/components/client/commons/Layout';
import { SIDER_WIDTH } from '@/consts/theme';
import { permanentRedirect } from 'next/navigation';

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

export default async function RollappLayout({
  children,
  params,
}: RollappLayoutProps) {
  const rollappInfo = await getRollAppInfoByRollappPath(params.rollappPath);
  if (!rollappInfo) return permanentRedirect('/');
  return (
    <Layout>
      <Box
        width={{ xs: '100vw', md: `calc(100vw - ${SIDER_WIDTH}px)` }}
        component="main"
        flexGrow={1}>
        <CustomToolbar />
        <Container sx={{ py: 1 }}>
          <PageBreadcrumb />
          <Card variant="outlined">
            <CardContent>{children}</CardContent>
          </Card>
        </Container>
      </Box>
    </Layout>
  );
}
