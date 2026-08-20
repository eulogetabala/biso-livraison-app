export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  Main: undefined;
  Restaurant: { id: string; name: string };
  Checkout: undefined;
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
  Orders: undefined;
  Profile: undefined;
};
