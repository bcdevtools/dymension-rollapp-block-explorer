import type { Metadata } from 'next';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { cookies } from 'next/headers';
import Layout from '@/components/commons/Layout';
import { ThemeMode } from '@/consts/theme';
import { StoreProvider } from '@/components/commons/StoreProvider';
import { getChainInfos } from '@/services/db/chainInfo';
import { normalizeRollappsInfo } from '@/utils/rollappInfo';

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
            <Layout initialThemeMode={themeMode}>{children}</Layout>
          </StoreProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
