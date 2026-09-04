import React from 'react';
import { View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NavigationContainerRefWithCurrent } from '@react-navigation/native';
import AnimatedSplashScreen from '../screens/AnimatedSplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import OtpScreen from '../screens/OtpScreen';
import RestaurantScreen from '../screens/RestaurantScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import OrdersScreen from '../screens/OrdersScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';
import DriversScreen from '../screens/DriversScreen';
import DriverDetailScreen from '../screens/DriverDetailScreen';
import NearbyMapScreen from '../screens/NearbyMapScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import RestaurantsScreen from '../screens/RestaurantsScreen';
import ProductsScreen from '../screens/ProductsScreen';
import ParcelScreen from '../screens/ParcelScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import MainTabs from './MainTabs';
import AppTabBar from '../components/AppTabBar';
import SplashPlaceholder from '../components/SplashPlaceholder';
import { colors } from '../theme';
import { useAuth } from '../lib/auth';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

type Props = {
  navigationRef: NavigationContainerRefWithCurrent<RootStackParamList>;
  routeName: string | null;
};

export default function RootNavigator({ navigationRef, routeName }: Props) {
  const { initializing } = useAuth();

  if (initializing) {
    return <SplashPlaceholder />;
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          headerTintColor: colors.primary,
          headerTitleStyle: { fontWeight: '700' },
          headerStyle: { backgroundColor: colors.surface },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="Splash" component={AnimatedSplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Otp" component={OtpScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="Restaurant" component={RestaurantScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen name="Orders" component={OrdersScreen} />
        <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
        <Stack.Screen name="Categories" component={CategoriesScreen} />
        <Stack.Screen name="Restaurants" component={RestaurantsScreen} />
        <Stack.Screen name="Products" component={ProductsScreen} />
        <Stack.Screen name="Parcel" component={ParcelScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Drivers" component={DriversScreen} />
        <Stack.Screen name="DriverDetail" component={DriverDetailScreen} />
        <Stack.Screen name="NearbyMap" component={NearbyMapScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      </Stack.Navigator>
      <AppTabBar navigationRef={navigationRef} routeName={routeName} />
    </View>
  );
}
