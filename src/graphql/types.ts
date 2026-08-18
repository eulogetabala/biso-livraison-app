export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: string; output: string; }
};

export type AddTrackingEventInput = {
  deliveryId: Scalars['ID']['input'];
  latitude?: InputMaybe<Scalars['Float']['input']>;
  longitude?: InputMaybe<Scalars['Float']['input']>;
  message?: InputMaybe<Scalars['String']['input']>;
  status: DeliveryStatus;
};

export type AssignDriverInput = {
  driverId: Scalars['ID']['input'];
  orderId: Scalars['ID']['input'];
};

export type CreateMenuItemInput = {
  category: MenuItemCategory;
  description?: InputMaybe<Scalars['String']['input']>;
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  isAvailable?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  price: Scalars['Float']['input'];
  restaurantId: Scalars['ID']['input'];
};

export type CreateOrderInput = {
  deliveryAddress: Scalars['String']['input'];
  deliveryCity: Scalars['String']['input'];
  deliveryZipCode: Scalars['String']['input'];
  items: Array<CreateOrderItemInput>;
  paymentMethod?: InputMaybe<PaymentMethod>;
  restaurantId: Scalars['ID']['input'];
};

export type CreateOrderItemInput = {
  menuItemId: Scalars['ID']['input'];
  quantity: Scalars['Int']['input'];
};

export type CreateParcelInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  receiverAddress: Scalars['String']['input'];
  receiverName: Scalars['String']['input'];
  receiverPhone: Scalars['String']['input'];
  weight?: InputMaybe<Scalars['Float']['input']>;
};

export type CreateRestaurantInput = {
  address: Scalars['String']['input'];
  city: Scalars['String']['input'];
  coverImageUrl?: InputMaybe<Scalars['String']['input']>;
  cuisineType: Scalars['String']['input'];
  deliveryFee?: InputMaybe<Scalars['Float']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  estimatedDeliveryTime?: InputMaybe<Scalars['Float']['input']>;
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  phone: Scalars['String']['input'];
  rating?: InputMaybe<Scalars['Float']['input']>;
  zipCode: Scalars['String']['input'];
};

export type CreateReviewInput = {
  comment?: InputMaybe<Scalars['String']['input']>;
  driverId?: InputMaybe<Scalars['ID']['input']>;
  orderId: Scalars['ID']['input'];
  rating: Scalars['Int']['input'];
  restaurantId?: InputMaybe<Scalars['ID']['input']>;
};

export type CreateUserInput = {
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  password: Scalars['String']['input'];
  phone: Scalars['String']['input'];
};

export type DailyOrdersModel = {
  __typename?: 'DailyOrdersModel';
  date: Scalars['String']['output'];
  orders: Scalars['Int']['output'];
  revenue: Scalars['Float']['output'];
};

export type DeliveryModel = {
  __typename?: 'DeliveryModel';
  createdAt: Scalars['DateTime']['output'];
  deliveredAt?: Maybe<Scalars['DateTime']['output']>;
  driver?: Maybe<UserModel>;
  driverId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  order?: Maybe<OrderModel>;
  orderId: Scalars['ID']['output'];
  pickedUpAt?: Maybe<Scalars['DateTime']['output']>;
  status: DeliveryStatus;
  updatedAt: Scalars['DateTime']['output'];
};

/** Current status of a delivery */
export type DeliveryStatus =
  | 'ASSIGNED'
  | 'DELIVERED'
  | 'IN_TRANSIT'
  | 'PICKED_UP';

export type DriverLocationModel = {
  __typename?: 'DriverLocationModel';
  deliveryId?: Maybe<Scalars['ID']['output']>;
  driverId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  latitude: Scalars['Float']['output'];
  longitude: Scalars['Float']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type DriverModel = {
  __typename?: 'DriverModel';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  isAvailable: Scalars['Boolean']['output'];
  rating: Scalars['Float']['output'];
  reviewCount: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
  user?: Maybe<UserModel>;
  userId: Scalars['ID']['output'];
  vehiclePlate?: Maybe<Scalars['String']['output']>;
  vehicleType: Scalars['String']['output'];
};

export type LoginInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type LoginResultModel = {
  __typename?: 'LoginResultModel';
  accessToken: Scalars['String']['output'];
  user: UserModel;
};

export type MarkNotificationReadInput = {
  id: Scalars['ID']['input'];
};

/** Category of a menu item */
export type MenuItemCategory =
  | 'APPETIZER'
  | 'DESSERT'
  | 'DRINK'
  | 'FRUIT'
  | 'LUNCH'
  | 'MAIN_COURSE'
  | 'SIDE'
  | 'SNACK';

export type MenuItemModel = {
  __typename?: 'MenuItemModel';
  category: MenuItemCategory;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  isAvailable: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  price: Scalars['Float']['output'];
  restaurant?: Maybe<RestaurantModel>;
  restaurantId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addTrackingEvent: TrackingEventModel;
  assignAvailableDriver: DeliveryModel;
  assignDriver: DeliveryModel;
  cancelOrder: OrderModel;
  collectCashOnDelivery: PaymentModel;
  createDriverProfile: DriverModel;
  createMenuItem: MenuItemModel;
  createOrder: OrderModel;
  createParcel: ParcelModel;
  createRestaurant: RestaurantModel;
  createReview: ReviewModel;
  createUser: UserModel;
  deleteDelivery: DeliveryModel;
  deleteMenuItem: MenuItemModel;
  deleteOrder: OrderModel;
  deleteParcel: ParcelModel;
  deleteRestaurant: RestaurantModel;
  deleteReview: ReviewModel;
  login: LoginResultModel;
  markAllNotificationsAsRead: Scalars['Int']['output'];
  markNotificationAsRead: NotificationModel;
  setDriverAvailability: DriverModel;
  updateDeliveryStatus: DeliveryModel;
  updateDriverLocation: DriverLocationModel;
  updateDriverProfile: DriverModel;
  updateMenuItem: MenuItemModel;
  updateOrderStatus: OrderModel;
  updateParcelStatus: ParcelModel;
  updateProfile: UserModel;
  updateRestaurant: RestaurantModel;
  updateReview: ReviewModel;
};


export type MutationAddTrackingEventArgs = {
  input: AddTrackingEventInput;
};


export type MutationAssignAvailableDriverArgs = {
  orderId: Scalars['ID']['input'];
};


export type MutationAssignDriverArgs = {
  input: AssignDriverInput;
};


export type MutationCancelOrderArgs = {
  id: Scalars['ID']['input'];
};


export type MutationCollectCashOnDeliveryArgs = {
  orderId: Scalars['ID']['input'];
};


export type MutationCreateDriverProfileArgs = {
  userId: Scalars['ID']['input'];
  vehiclePlate?: InputMaybe<Scalars['String']['input']>;
  vehicleType?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreateMenuItemArgs = {
  input: CreateMenuItemInput;
};


export type MutationCreateOrderArgs = {
  input: CreateOrderInput;
};


export type MutationCreateParcelArgs = {
  input: CreateParcelInput;
};


export type MutationCreateRestaurantArgs = {
  input: CreateRestaurantInput;
};


export type MutationCreateReviewArgs = {
  input: CreateReviewInput;
};


export type MutationCreateUserArgs = {
  input: CreateUserInput;
};


export type MutationDeleteDeliveryArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteMenuItemArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteOrderArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteParcelArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteRestaurantArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteReviewArgs = {
  id: Scalars['ID']['input'];
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationMarkNotificationAsReadArgs = {
  input: MarkNotificationReadInput;
};


export type MutationSetDriverAvailabilityArgs = {
  input: SetDriverAvailabilityInput;
};


export type MutationUpdateDeliveryStatusArgs = {
  input: UpdateDeliveryStatusInput;
};


export type MutationUpdateDriverLocationArgs = {
  input: UpdateDriverLocationInput;
};


export type MutationUpdateDriverProfileArgs = {
  input: UpdateDriverProfileInput;
};


export type MutationUpdateMenuItemArgs = {
  input: UpdateMenuItemInput;
};


export type MutationUpdateOrderStatusArgs = {
  input: UpdateOrderStatusInput;
};


export type MutationUpdateParcelStatusArgs = {
  input: UpdateParcelStatusInput;
};


export type MutationUpdateProfileArgs = {
  input: UpdateProfileInput;
};


export type MutationUpdateRestaurantArgs = {
  input: UpdateRestaurantInput;
};


export type MutationUpdateReviewArgs = {
  input: UpdateReviewInput;
};

export type NotificationModel = {
  __typename?: 'NotificationModel';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  message: Scalars['String']['output'];
  readAt?: Maybe<Scalars['DateTime']['output']>;
  title: Scalars['String']['output'];
  type: NotificationType;
  userId: Scalars['ID']['output'];
};

/** Type of a notification */
export type NotificationType =
  | 'DELIVERY_STATUS'
  | 'ORDER_STATUS'
  | 'PAYMENT'
  | 'PROMOTIONAL';

export type OrderItemModel = {
  __typename?: 'OrderItemModel';
  id: Scalars['ID']['output'];
  menuItem?: Maybe<MenuItemModel>;
  menuItemId: Scalars['ID']['output'];
  orderId: Scalars['ID']['output'];
  quantity: Scalars['Int']['output'];
  unitPrice: Scalars['Float']['output'];
};

export type OrderModel = {
  __typename?: 'OrderModel';
  createdAt: Scalars['DateTime']['output'];
  delivery?: Maybe<DeliveryModel>;
  deliveryAddress: Scalars['String']['output'];
  deliveryCity: Scalars['String']['output'];
  deliveryFee: Scalars['Float']['output'];
  deliveryZipCode: Scalars['String']['output'];
  grandTotal: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
  items: Array<OrderItemModel>;
  payment?: Maybe<PaymentModel>;
  restaurant?: Maybe<RestaurantModel>;
  restaurantId: Scalars['ID']['output'];
  status: OrderStatus;
  total: Scalars['Float']['output'];
  updatedAt: Scalars['DateTime']['output'];
  user?: Maybe<UserModel>;
  userId: Scalars['ID']['output'];
};

/** Current status of an order */
export type OrderStatus =
  | 'CANCELLED'
  | 'CONFIRMED'
  | 'DELIVERED'
  | 'IN_TRANSIT'
  | 'PENDING'
  | 'PREPARING';

export type OrdersByStatusModel = {
  __typename?: 'OrdersByStatusModel';
  count: Scalars['Int']['output'];
  status: OrderStatus;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  currentPage: Scalars['Int']['output'];
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  limit: Scalars['Int']['output'];
  totalItems: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type PaginatedDeliveryModel = {
  __typename?: 'PaginatedDeliveryModel';
  items: Array<DeliveryModel>;
  pageInfo: PageInfo;
};

export type PaginatedMenuItemModel = {
  __typename?: 'PaginatedMenuItemModel';
  items: Array<MenuItemModel>;
  pageInfo: PageInfo;
};

export type PaginatedNotificationModel = {
  __typename?: 'PaginatedNotificationModel';
  items: Array<NotificationModel>;
  pageInfo: PageInfo;
};

export type PaginatedOrderModel = {
  __typename?: 'PaginatedOrderModel';
  items: Array<OrderModel>;
  pageInfo: PageInfo;
};

export type PaginatedParcelModel = {
  __typename?: 'PaginatedParcelModel';
  items: Array<ParcelModel>;
  pageInfo: PageInfo;
};

export type PaginatedRestaurantModel = {
  __typename?: 'PaginatedRestaurantModel';
  items: Array<RestaurantModel>;
  pageInfo: PageInfo;
};

export type PaginatedReviewModel = {
  __typename?: 'PaginatedReviewModel';
  items: Array<ReviewModel>;
  pageInfo: PageInfo;
};

export type ParcelModel = {
  __typename?: 'ParcelModel';
  createdAt: Scalars['DateTime']['output'];
  deliveredAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  receiverAddress: Scalars['String']['output'];
  receiverName: Scalars['String']['output'];
  receiverPhone: Scalars['String']['output'];
  sender?: Maybe<UserModel>;
  senderId: Scalars['ID']['output'];
  status: ParcelStatus;
  updatedAt: Scalars['DateTime']['output'];
  weight: Scalars['Float']['output'];
};

/** Current status of a parcel */
export type ParcelStatus =
  | 'CANCELLED'
  | 'DELIVERED'
  | 'IN_TRANSIT'
  | 'PENDING'
  | 'PICKED_UP';

/** Payment method used for an order */
export type PaymentMethod =
  | 'CASH_ON_DELIVERY';

export type PaymentModel = {
  __typename?: 'PaymentModel';
  amount: Scalars['Float']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  method: PaymentMethod;
  order?: Maybe<OrderModel>;
  orderId: Scalars['ID']['output'];
  paidAt?: Maybe<Scalars['DateTime']['output']>;
  status: PaymentStatus;
  updatedAt: Scalars['DateTime']['output'];
};

/** Current status of a payment */
export type PaymentStatus =
  | 'CANCELLED'
  | 'PAID'
  | 'PENDING';

export type Query = {
  __typename?: 'Query';
  availableDrivers: Array<DriverModel>;
  dailyOrders: Array<DailyOrdersModel>;
  deliveries: PaginatedDeliveryModel;
  deliveryByOrder: DeliveryModel;
  driver: DriverModel;
  driverLocation: DriverLocationModel;
  driverLocations: Array<DriverLocationModel>;
  drivers: Array<DriverModel>;
  me: UserModel;
  menuItem: MenuItemModel;
  menuItems: PaginatedMenuItemModel;
  menuItemsByRestaurant: PaginatedMenuItemModel;
  myDeliveries: PaginatedDeliveryModel;
  myDriverProfile: DriverModel;
  myLocation: DriverLocationModel;
  myNotifications: PaginatedNotificationModel;
  myOrders: PaginatedOrderModel;
  myParcels: PaginatedParcelModel;
  myReviews: PaginatedReviewModel;
  order: OrderModel;
  orders: PaginatedOrderModel;
  ordersByStatus: Array<OrdersByStatusModel>;
  parcel: ParcelModel;
  parcels: PaginatedParcelModel;
  paymentByOrder: PaymentModel;
  payments: Array<PaymentModel>;
  restaurant: RestaurantModel;
  restaurants: PaginatedRestaurantModel;
  revenueByRestaurant: Array<RevenueByRestaurantModel>;
  review: ReviewModel;
  reviews: PaginatedReviewModel;
  reviewsByDriver: PaginatedReviewModel;
  reviewsByRestaurant: PaginatedReviewModel;
  searchMenuItems: PaginatedMenuItemModel;
  searchRestaurants: PaginatedRestaurantModel;
  statisticsOverview: StatisticsOverviewModel;
  topRestaurants: Array<RevenueByRestaurantModel>;
  trackDelivery: DriverLocationModel;
  trackingByDelivery: Array<TrackingEventModel>;
  unreadNotificationsCount: Scalars['Int']['output'];
  users: Array<UserModel>;
};


export type QueryDailyOrdersArgs = {
  range?: InputMaybe<StatisticsRangeInput>;
};


export type QueryDeliveriesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryDeliveryByOrderArgs = {
  orderId: Scalars['ID']['input'];
};


export type QueryDriverArgs = {
  id: Scalars['ID']['input'];
};


export type QueryDriverLocationArgs = {
  driverId: Scalars['ID']['input'];
};


export type QueryMenuItemArgs = {
  id: Scalars['ID']['input'];
};


export type QueryMenuItemsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryMenuItemsByRestaurantArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  restaurantId: Scalars['ID']['input'];
};


export type QueryMyDeliveriesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryMyNotificationsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryMyOrdersArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryMyParcelsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryMyReviewsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryOrderArgs = {
  id: Scalars['ID']['input'];
};


export type QueryOrdersArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryParcelArgs = {
  id: Scalars['ID']['input'];
};


export type QueryParcelsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryPaymentByOrderArgs = {
  orderId: Scalars['ID']['input'];
};


export type QueryRestaurantArgs = {
  id: Scalars['ID']['input'];
};


export type QueryRestaurantsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryRevenueByRestaurantArgs = {
  range?: InputMaybe<StatisticsRangeInput>;
};


export type QueryReviewArgs = {
  id: Scalars['ID']['input'];
};


export type QueryReviewsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryReviewsByDriverArgs = {
  driverId: Scalars['ID']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryReviewsByRestaurantArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  restaurantId: Scalars['ID']['input'];
};


export type QuerySearchMenuItemsArgs = {
  input?: InputMaybe<SearchMenuItemsInput>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};


export type QuerySearchRestaurantsArgs = {
  input?: InputMaybe<SearchRestaurantsInput>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryTopRestaurantsArgs = {
  input?: InputMaybe<TopRestaurantsInput>;
};


export type QueryTrackDeliveryArgs = {
  orderId: Scalars['ID']['input'];
};


export type QueryTrackingByDeliveryArgs = {
  deliveryId: Scalars['ID']['input'];
};

export type RestaurantModel = {
  __typename?: 'RestaurantModel';
  address: Scalars['String']['output'];
  city: Scalars['String']['output'];
  coverImageUrl?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  cuisineType: Scalars['String']['output'];
  deliveryFee: Scalars['Float']['output'];
  description?: Maybe<Scalars['String']['output']>;
  estimatedDeliveryTime: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  phone: Scalars['String']['output'];
  rating: Scalars['Float']['output'];
  updatedAt: Scalars['DateTime']['output'];
  zipCode: Scalars['String']['output'];
};

export type RevenueByRestaurantModel = {
  __typename?: 'RevenueByRestaurantModel';
  orderCount: Scalars['Int']['output'];
  restaurantId: Scalars['ID']['output'];
  restaurantName: Scalars['String']['output'];
  revenue: Scalars['Float']['output'];
};

export type ReviewModel = {
  __typename?: 'ReviewModel';
  author?: Maybe<UserModel>;
  comment?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  driver?: Maybe<UserModel>;
  driverId?: Maybe<Scalars['ID']['output']>;
  id: Scalars['ID']['output'];
  order?: Maybe<OrderModel>;
  orderId: Scalars['ID']['output'];
  rating: Scalars['Int']['output'];
  restaurant?: Maybe<RestaurantModel>;
  restaurantId?: Maybe<Scalars['ID']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['ID']['output'];
};

export type SearchMenuItemsInput = {
  category?: InputMaybe<MenuItemCategory>;
  onlyAvailable?: InputMaybe<Scalars['Boolean']['input']>;
  query?: InputMaybe<Scalars['String']['input']>;
  restaurantId?: InputMaybe<Scalars['ID']['input']>;
};

export type SearchRestaurantsInput = {
  city?: InputMaybe<Scalars['String']['input']>;
  cuisineType?: InputMaybe<Scalars['String']['input']>;
  minRating?: InputMaybe<Scalars['Float']['input']>;
  onlyActive?: InputMaybe<Scalars['Boolean']['input']>;
  query?: InputMaybe<Scalars['String']['input']>;
};

export type SetDriverAvailabilityInput = {
  isAvailable: Scalars['Boolean']['input'];
};

export type StatisticsOverviewModel = {
  __typename?: 'StatisticsOverviewModel';
  activeDrivers: Scalars['Int']['output'];
  activeRestaurants: Scalars['Int']['output'];
  averageOrderValue: Scalars['Float']['output'];
  pendingOrders: Scalars['Int']['output'];
  totalOrders: Scalars['Int']['output'];
  totalRevenue: Scalars['Float']['output'];
};

export type StatisticsRangeInput = {
  from?: InputMaybe<Scalars['String']['input']>;
  to?: InputMaybe<Scalars['String']['input']>;
};

export type TopRestaurantsInput = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};

export type TrackingEventModel = {
  __typename?: 'TrackingEventModel';
  createdAt: Scalars['DateTime']['output'];
  delivery?: Maybe<DeliveryModel>;
  deliveryId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  latitude?: Maybe<Scalars['Float']['output']>;
  longitude?: Maybe<Scalars['Float']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  status: DeliveryStatus;
};

export type UpdateDeliveryStatusInput = {
  id: Scalars['ID']['input'];
  status: DeliveryStatus;
};

export type UpdateDriverLocationInput = {
  deliveryId?: InputMaybe<Scalars['ID']['input']>;
  latitude: Scalars['Float']['input'];
  longitude: Scalars['Float']['input'];
};

export type UpdateDriverProfileInput = {
  vehiclePlate?: InputMaybe<Scalars['String']['input']>;
  vehicleType?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateMenuItemInput = {
  category?: InputMaybe<MenuItemCategory>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  isAvailable?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['Float']['input']>;
  restaurantId?: InputMaybe<Scalars['ID']['input']>;
};

export type UpdateOrderStatusInput = {
  id: Scalars['ID']['input'];
  status: OrderStatus;
};

export type UpdateParcelStatusInput = {
  id: Scalars['ID']['input'];
  status: ParcelStatus;
};

export type UpdateProfileInput = {
  avatarUrl?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateRestaurantInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  coverImageUrl?: InputMaybe<Scalars['String']['input']>;
  cuisineType?: InputMaybe<Scalars['String']['input']>;
  deliveryFee?: InputMaybe<Scalars['Float']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  estimatedDeliveryTime?: InputMaybe<Scalars['Float']['input']>;
  id: Scalars['String']['input'];
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  rating?: InputMaybe<Scalars['Float']['input']>;
  zipCode?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateReviewInput = {
  comment?: InputMaybe<Scalars['String']['input']>;
  driverId?: InputMaybe<Scalars['ID']['input']>;
  id: Scalars['ID']['input'];
  orderId?: InputMaybe<Scalars['ID']['input']>;
  rating?: InputMaybe<Scalars['Int']['input']>;
  restaurantId?: InputMaybe<Scalars['ID']['input']>;
};

export type UserModel = {
  __typename?: 'UserModel';
  avatarUrl?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lastName: Scalars['String']['output'];
  phone: Scalars['String']['output'];
  role: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};
