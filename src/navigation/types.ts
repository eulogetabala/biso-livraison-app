import type { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  Otp: {
    phone: string;
    firstName: string;
    lastName: string;
    password: string;
  };
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  Restaurant: { id: string; name: string };
  Checkout: undefined;
  Orders: undefined;
  OrderDetail: { id: string };
  Drivers: undefined;
  DriverDetail: { id: string };
  NearbyMap: undefined;
  Categories: { selectedCategory?: string } | undefined;
  Restaurants: undefined;
  Products: { category?: string } | undefined;
  Parcel: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Favorites: undefined;
  Cart: undefined;
  Profile: undefined;
};
