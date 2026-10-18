import '@/global.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { LoadingState } from '@/components/ui/states';
import { getDatabase } from '@/db/client';
import { useTheme } from '@/hooks/use-theme';
import { queryClient } from '@/lib/query-client';

function AppStack() {
  const { scheme } = useTheme();
  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="transactions/new"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="transactions/[id]"
          options={{ presentation: 'card' }}
        />
        <Stack.Screen
          name="budgets/edit"
          options={{ presentation: 'modal' }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getDatabase()
      .then(() => mounted && setDbReady(true))
      .catch((err) => {
        console.error('DB init failed', err);
        if (mounted) setDbError(err instanceof Error ? err.message : 'Database error');
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          {dbError ? (
            <View className="flex-1 items-center justify-center bg-background px-6">
              <AppText variant="heading" className="text-center text-negative">
                Could not open the database
              </AppText>
              <AppText variant="caption" className="mt-2 text-center">
                {dbError}
              </AppText>
            </View>
          ) : dbReady ? (
            <AppStack />
          ) : (
            <View className="flex-1 items-center justify-center bg-background">
              <LoadingState label="Preparing your finances…" />
            </View>
          )}
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
