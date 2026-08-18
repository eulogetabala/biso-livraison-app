import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import RestaurantScreen from '../screens/RestaurantScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';
import MainTabs from './MainTabs';
import { colors } from '../theme';
import { useAuth } from '../lib/auth';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { user, initializing } = useAuth();

  if (initializing) {
    // Rendu minimal pendant la restauration de la session.
    return null;
  }

  return (
    <Stack.Navigator
      initialRouteName={user ? 'Main' : 'Login'}
      screenOptions={{
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: '700' },
        headerStyle: { backgroundColor: colors.surface },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Inscription' }} />
      <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen
        name="Restaurant"
        component={RestaurantScreen}
        options={({ route }) => ({ title: route.params.name })}
      />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Panier' }} />
      <Stack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{ title: 'Détail de la commande' }}
      />
    </Stack.Navigator>
  );
}
