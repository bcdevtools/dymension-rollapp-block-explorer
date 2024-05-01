import type { Metadata } from 'next';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { cookies } from 'next/headers';
import { ThemeMode } from '@/consts/theme';
import { StoreProvider } from '@/components/client/commons/StoreProvider';
import { getChainInfos } from '@/services/db/chainInfo';
import { normalizeRollappsInfo } from '@/utils/rollapp';
import ThemeProvider from '@/components/client/commons/ThemeProvider';
import { ErrorContextProvider } from '@/contexts/ErrorContext';
import { ErrorSnackbar } from '@/components/client/commons/ErrorSnackbar';

export const metadata: Metadata = {
  title: 'Dymension RollApps Blockchain Explorer',
  description: 'Dymension RollApps Blockchain Explorer',
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
    : ThemeMode.DARK;

  const chainInfos = await getChainInfos();

  const initialState = {
    rollappInfos: normalizeRollappsInfo(chainInfos),
  };

  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
          <StoreProvider initialState={initialState}>
            <ThemeProvider initialThemeMode={themeMode}>
              <ErrorContextProvider>
                {children}
                <ErrorSnackbar />
              </ErrorContextProvider>
            </ThemeProvider>
          </StoreProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
