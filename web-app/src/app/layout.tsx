import type { Metadata } from 'next';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { cookies } from 'next/headers';
import Layout from '@/components/client/commons/Layout';
import { ThemeMode } from '@/consts/theme';
import { StoreProvider } from '@/components/client/commons/StoreProvider';
import { getChainInfos } from '@/services/db/chainInfo';
import { normalizeRollappsInfo } from '@/utils/rollappInfo';
import Box from '@mui/material/Box';
import { CustomToolbar } from '@/components/client/commons/Layout/_Header';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import PageBreadcrumb from '@/components/commons/PageBreadcrumb';

export const metadata: Metadata = {
  title: 'Blockchain Explorer',
  description: 'Blockchain Explorer by TeddyNguyen',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = cookies();
  const themeCookie = cookieStore.get('theme');
  const themeMode = themeCookie
    ? (themeCookie.value as ThemeMode)
    : ThemeMode.LIGHT;

  const chainInfos = await getChainInfos();

  const initialState = {
    rollappInfos: normalizeRollappsInfo(chainInfos),
  };

  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
          <StoreProvider initialState={initialState}>
            <Layout initialThemeMode={themeMode}>
              <Box
                component="main"
                sx={{
                  flexGrow: 1,
                  // width: { md: `calc(100vh - ${SIDER_WIDTH}px)` },
                  height: {
                    xs: `calc(100vh - ${128}px)`,
                    md: `calc(100vh - ${64}px)`,
                  },
                }}>
                <CustomToolbar />
                <Container>
                  <PageBreadcrumb />
                  <Paper sx={{ my: 1, p: 2 }} elevation={1}>
                    {children}
                  </Paper>
                </Container>
              </Box>
            </Layout>
          </StoreProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
