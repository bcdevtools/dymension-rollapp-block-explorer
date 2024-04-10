import { getRollAppInfoByRollappPath } from '@/services/chain.service';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import PageBreadcrumb from '@/components/commons/PageBreadcrumb';
import { CardContent } from '@mui/material';
import { CustomToolbar } from '@/components/client/commons/Layout/_Header';

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

export default async function Layout({ children }: RollappLayoutProps) {
  return (
    <Container sx={{ py: 1 }}>
      <CustomToolbar />
      <PageBreadcrumb />
      <Card variant="outlined">
        <CardContent>{children}</CardContent>
      </Card>
    </Container>
  );
}
