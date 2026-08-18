export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
  Restaurant: { id: string; name: string };
  Checkout: undefined;
  OrderDetail: { id: string };
};

export type MainTabParamList = {
  Home: undefined;
  Orders: undefined;
  Profile: undefined;
};
