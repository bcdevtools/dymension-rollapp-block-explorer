import type { Metadata } from 'next';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { cookies } from 'next/headers';
import Layout from '@/components/commons/Layout';
import { ThemeMode } from '@/consts/theme';
import { StoreProvider } from '@/components/commons/StoreProvider';

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

  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
          <StoreProvider>
            <Layout initialThemeMode={themeMode}>{children}</Layout>
          </StoreProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
