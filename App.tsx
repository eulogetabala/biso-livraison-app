import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { ApolloProvider, ApolloClient } from '@apollo/client';
import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';
import { PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans';
import { bootstrapApiUrl } from './src/lib/api';
import { createApolloClient } from './src/lib/apollo';
import { AuthProvider } from './src/lib/auth';
import { CartProvider } from './src/lib/cart';
import { FavoritesProvider } from './src/lib/favorites';
import { NotificationsProvider } from './src/lib/notifications';
import RootNavigator from './src/navigation/RootNavigator';
import SplashPlaceholder from './src/components/SplashPlaceholder';
import type { RootStackParamList } from './src/navigation/types';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  const [routeName, setRouteName] = useState<string | null>(null);
  const [apolloClient, setApolloClient] = useState<ApolloClient<unknown> | null>(null);

  const [fontsLoaded] = useFonts({
    Montserrat_700Bold,
    Montserrat_600SemiBold,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_700Bold,
  });

  useEffect(() => {
    let cancelled = false;
    bootstrapApiUrl().then((apiUrl) => {
      if (cancelled) return;
      setApolloClient(createApolloClient(apiUrl));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const syncRoute = useCallback(() => {
    setRouteName(navigationRef.getCurrentRoute()?.name ?? null);
  }, [navigationRef]);

  if (!fontsLoaded || !apolloClient) {
    return <SplashPlaceholder />;
  }

  return (
    <SafeAreaProvider>
      <ApolloProvider client={apolloClient}>
        <AuthProvider>
          <CartProvider>
            <FavoritesProvider>
              <NotificationsProvider>
                <NavigationContainer ref={navigationRef} onReady={syncRoute} onStateChange={syncRoute}>
                  <StatusBar style="dark" />
                  <RootNavigator navigationRef={navigationRef} routeName={routeName} />
                </NavigationContainer>
              </NotificationsProvider>
            </FavoritesProvider>
          </CartProvider>
        </AuthProvider>
      </ApolloProvider>
    </SafeAreaProvider>
  );
}
