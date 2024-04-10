import type { Metadata } from 'next';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { cookies } from 'next/headers';
import Layout from '@/components/client/commons/Layout';
import {
  SIDER_WIDTH,
  TOOLBAR_HEIGHT,
  TOOLBAR_MOBILE_HEIGHT,
  ThemeMode,
} from '@/consts/theme';
import { StoreProvider } from '@/components/client/commons/StoreProvider';
import { getChainInfos } from '@/services/db/chainInfo';
import { normalizeRollappsInfo } from '@/utils/rollapp';
import Box from '@mui/material/Box';
import { CustomToolbar } from '@/components/client/commons/Layout/_Header';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
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
                width={{ xs: '100vw', md: `calc(100vw - ${SIDER_WIDTH}px)` }}
                component="main"
                flexGrow={1}>
                {children}
              </Box>
            </Layout>
          </StoreProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
