import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AnimatedSplashScreen from '../screens/AnimatedSplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import RestaurantScreen from '../screens/RestaurantScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';
import DriversScreen from '../screens/DriversScreen';
import DriverDetailScreen from '../screens/DriverDetailScreen';
import NearbyMapScreen from '../screens/NearbyMapScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import RestaurantsScreen from '../screens/RestaurantsScreen';
import ProductsScreen from '../screens/ProductsScreen';
import ParcelScreen from '../screens/ParcelScreen';
import MainTabs from './MainTabs';
import { colors } from '../theme';
import { useAuth } from '../lib/auth';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { initializing } = useAuth();

  if (initializing) {
    // Rendu minimal pendant la restauration de la session.
    return null;
  }

  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: '700' },
        headerStyle: { backgroundColor: colors.surface },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="Splash" component={AnimatedSplashScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
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
      <Stack.Screen name="Categories" component={CategoriesScreen} options={{ title: 'Catégories' }} />
      <Stack.Screen name="Restaurants" component={RestaurantsScreen} options={{ title: 'Restaurants' }} />
      <Stack.Screen name="Products" component={ProductsScreen} options={{ title: 'Produits' }} />
      <Stack.Screen name="Parcel" component={ParcelScreen} options={{ title: 'Expédition colis' }} />
      <Stack.Screen name="Drivers" component={DriversScreen} options={{ title: 'Livreurs disponibles' }} />
      <Stack.Screen name="DriverDetail" component={DriverDetailScreen} options={{ title: 'Profil livreur' }} />
      <Stack.Screen name="NearbyMap" component={NearbyMapScreen} options={{ title: 'Restaurants proches' }} />
    </Stack.Navigator>
  );
}
