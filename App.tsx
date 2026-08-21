import React, { useCallback, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { ApolloProvider } from '@apollo/client';
import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';
import { PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans';
import { apolloClient } from './src/lib/apollo';
import { AuthProvider } from './src/lib/auth';
import { CartProvider } from './src/lib/cart';
import { FavoritesProvider } from './src/lib/favorites';
import RootNavigator from './src/navigation/RootNavigator';
import type { RootStackParamList } from './src/navigation/types';

export default function App() {
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  const [routeName, setRouteName] = useState<string | null>(null);

  const [fontsLoaded] = useFonts({
    Montserrat_700Bold,
    Montserrat_600SemiBold,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_700Bold,
  });

  const syncRoute = useCallback(() => {
    setRouteName(navigationRef.getCurrentRoute()?.name ?? null);
  }, [navigationRef]);

  if (!fontsLoaded) {
    return null; // ou un splashscreen minimal, mais l'AnimatedSplashScreen prendra le relais immédiatement après
  }

  return (
    <SafeAreaProvider>
      <ApolloProvider client={apolloClient}>
        <AuthProvider>
          <CartProvider>
            <FavoritesProvider>
              <NavigationContainer ref={navigationRef} onReady={syncRoute} onStateChange={syncRoute}>
                <StatusBar style="dark" />
                <RootNavigator navigationRef={navigationRef} routeName={routeName} />
              </NavigationContainer>
            </FavoritesProvider>
          </CartProvider>
        </AuthProvider>
      </ApolloProvider>
    </SafeAreaProvider>
  );
}
