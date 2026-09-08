/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type * as Types from './types';

import { gql } from '@apollo/client';
import * as ApolloReactCommon from '@apollo/client';
import * as ApolloReactHooks from '@apollo/client';
const defaultOptions = {} as const;
export type LoginMutationVariables = Exact<{
  input: Types.LoginInput;
}>;


export type LoginMutation = { login: { accessToken: string, user: { id: string, email: string | null, firstName: string, lastName: string, phone: string, role: Types.UserRole, avatarUrl: string | null, createdAt: string, updatedAt: string } } };

export type RegisterMutationVariables = Exact<{
  input: Types.CreateUserInput;
}>;


export type RegisterMutation = { createUser: { id: string, email: string | null, firstName: string, lastName: string, role: Types.UserRole, phone: string } };

export type RequestOtpMutationVariables = Exact<{
  input: Types.RequestOtpInput;
}>;


export type RequestOtpMutation = { requestOtp: { phone: string, expiresIn: number, devCode: string | null } };

export type VerifyOtpMutationVariables = Exact<{
  input: Types.VerifyOtpInput;
}>;


export type VerifyOtpMutation = { verifyOtp: boolean };

export type UpdateProfileMutationVariables = Exact<{
  input: Types.UpdateProfileInput;
}>;


export type UpdateProfileMutation = { updateProfile: { id: string, firstName: string, lastName: string, phone: string, avatarUrl: string | null, role: Types.UserRole, email: string | null, createdAt: string, updatedAt: string } };

export type ResetPasswordMutationVariables = Exact<{
  input: Types.ResetPasswordInput;
}>;


export type ResetPasswordMutation = { resetPassword: boolean };

export type DeleteMyAccountMutationVariables = Exact<{ [key: string]: never; }>;


export type DeleteMyAccountMutation = { deleteMyAccount: { id: string } };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { me: { id: string, email: string | null, firstName: string, lastName: string, phone: string, role: Types.UserRole, avatarUrl: string | null } };

export type ActiveHomeBannersQueryVariables = Exact<{ [key: string]: never; }>;


export type ActiveHomeBannersQuery = { activeHomeBanners: Array<{ id: string, title: string, subtitle: string | null, imageUrl: string, ctaLabel: string | null, linkType: Types.BannerLinkType, linkValue: string | null, sortOrder: number, isActive: boolean }> };

export type ActiveMarketCategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type ActiveMarketCategoriesQuery = { activeMarketCategories: Array<{ id: string, label: string, subtitle: string | null, imageUrl: string | null, icon: string, iconLib: string, tint: string, iconColor: string, sortOrder: number, isActive: boolean }> };

export type ActiveCuisineTypesQueryVariables = Exact<{ [key: string]: never; }>;


export type ActiveCuisineTypesQuery = { activeCuisineTypes: Array<{ id: string, value: string, label: string, emoji: string | null, iconUrl: string | null, sortOrder: number, isActive: boolean }> };

export type MarketRestaurantQueryVariables = Exact<{ [key: string]: never; }>;


export type MarketRestaurantQuery = { marketRestaurant: { id: string, name: string, deliveryFee: number, estimatedDeliveryTime: number, isActive: boolean } | null };

export type AvailableDriversQueryVariables = Exact<{ [key: string]: never; }>;


export type AvailableDriversQuery = { availableDrivers: Array<{ id: string, userId: string, vehicleType: string, isAvailable: boolean, rating: number, reviewCount: number, createdAt: string, updatedAt: string, user: { id: string, firstName: string, lastName: string, phone: string } | null }> };

export type DriverQueryVariables = Exact<{
  id: string | number;
}>;


export type DriverQuery = { driver: { id: string, userId: string, vehicleType: string, isAvailable: boolean, rating: number, reviewCount: number, createdAt: string, updatedAt: string, user: { id: string, firstName: string, lastName: string, phone: string } | null } };

export type MyFavoritesQueryVariables = Exact<{ [key: string]: never; }>;


export type MyFavoritesQuery = { myFavorites: Array<{ id: string, targetId: string, kind: Types.FavoriteKind, name: string, imageUrl: string | null, price: number | null, seller: string | null, cuisineType: string | null, rating: number | null, city: string | null, createdAt: string }> };

export type ToggleFavoriteMutationVariables = Exact<{
  input: Types.ToggleFavoriteInput;
}>;


export type ToggleFavoriteMutation = { toggleFavorite: { id: string, targetId: string, kind: Types.FavoriteKind, name: string, imageUrl: string | null, price: number | null, seller: string | null, cuisineType: string | null, rating: number | null, city: string | null, createdAt: string } | null };

export type RemoveFavoriteMutationVariables = Exact<{
  targetId: string;
  kind: Types.FavoriteKind;
}>;


export type RemoveFavoriteMutation = { removeFavorite: boolean };

export type TrackDeliveryQueryVariables = Exact<{
  orderId: string | number;
}>;


export type TrackDeliveryQuery = { trackDelivery: { id: string, driverId: string, latitude: number, longitude: number, updatedAt: string } };

export type MyNotificationsQueryVariables = Exact<{
  page?: number | null | undefined;
  limit?: number | null | undefined;
}>;


export type MyNotificationsQuery = { myNotifications: { items: Array<{ id: string, type: Types.NotificationType, title: string, message: string, readAt: string | null, createdAt: string }>, pageInfo: { totalItems: number } } };

export type UnreadNotificationsCountQueryVariables = Exact<{ [key: string]: never; }>;


export type UnreadNotificationsCountQuery = { unreadNotificationsCount: number };

export type MarkNotificationAsReadMutationVariables = Exact<{
  input: Types.MarkNotificationReadInput;
}>;


export type MarkNotificationAsReadMutation = { markNotificationAsRead: { id: string, readAt: string | null } };

export type MarkAllNotificationsAsReadMutationVariables = Exact<{ [key: string]: never; }>;


export type MarkAllNotificationsAsReadMutation = { markAllNotificationsAsRead: number };

export type CreateOrderMutationVariables = Exact<{
  input: Types.CreateOrderInput;
}>;


export type CreateOrderMutation = { createOrder: { id: string, status: Types.OrderStatus, total: number, deliveryFee: number, grandTotal: number, deliveryAddress: string, deliveryCity: string, deliveryZipCode: string, deliveryLatitude: number | null, deliveryLongitude: number | null, createdAt: string, payment: { method: Types.PaymentMethod, status: Types.PaymentStatus, amount: number } | null, restaurant: { id: string, name: string, imageUrl: string | null } | null, items: Array<{ quantity: number, unitPrice: number, menuItem: { id: string, name: string, price: number } | null }> } };

export type MyOrdersQueryVariables = Exact<{
  page?: number | null | undefined;
  limit?: number | null | undefined;
}>;


export type MyOrdersQuery = { myOrders: { items: Array<{ id: string, status: Types.OrderStatus, total: number, deliveryFee: number, grandTotal: number, deliveryAddress: string, deliveryCity: string, createdAt: string, restaurant: { id: string, name: string, imageUrl: string | null } | null, payment: { method: Types.PaymentMethod, status: Types.PaymentStatus } | null, delivery: { id: string, status: Types.DeliveryStatus, driver: { id: string, firstName: string, lastName: string, phone: string } | null } | null }>, pageInfo: { totalItems: number, totalPages: number, currentPage: number, hasNextPage: boolean } } };

export type OrderQueryVariables = Exact<{
  id: string | number;
}>;


export type OrderQuery = { order: { id: string, status: Types.OrderStatus, total: number, deliveryFee: number, grandTotal: number, deliveryAddress: string, deliveryCity: string, deliveryZipCode: string, deliveryLatitude: number | null, deliveryLongitude: number | null, createdAt: string, restaurant: { id: string, name: string, imageUrl: string | null, phone: string, latitude: number | null, longitude: number | null } | null, items: Array<{ quantity: number, unitPrice: number, menuItem: { id: string, name: string, price: number } | null }>, payment: { method: Types.PaymentMethod, status: Types.PaymentStatus, amount: number } | null, delivery: { id: string, status: Types.DeliveryStatus, driver: { id: string, firstName: string, lastName: string, phone: string } | null } | null } };

export type CancelOrderMutationVariables = Exact<{
  id: string | number;
}>;


export type CancelOrderMutation = { cancelOrder: { id: string, status: Types.OrderStatus } };

export type CreateParcelMutationVariables = Exact<{
  input: Types.CreateParcelInput;
}>;


export type CreateParcelMutation = { createParcel: { id: string, status: Types.ParcelStatus, receiverName: string, receiverPhone: string, receiverAddress: string, description: string | null, weight: number, createdAt: string } };

export type MyParcelsQueryVariables = Exact<{
  page?: number | null | undefined;
  limit?: number | null | undefined;
}>;


export type MyParcelsQuery = { myParcels: { items: Array<{ id: string, status: Types.ParcelStatus, receiverName: string, receiverPhone: string, receiverAddress: string, description: string | null, weight: number, createdAt: string }>, pageInfo: { totalItems: number } } };

export type SearchRestaurantsQueryVariables = Exact<{
  page?: number | null | undefined;
  limit?: number | null | undefined;
  input?: Types.SearchRestaurantsInput | null | undefined;
}>;


export type SearchRestaurantsQuery = { searchRestaurants: { items: Array<{ id: string, name: string, description: string | null, address: string, city: string, zipCode: string, phone: string, cuisineType: string, imageUrl: string | null, coverImageUrl: string | null, rating: number, deliveryFee: number, estimatedDeliveryTime: number, latitude: number | null, longitude: number | null, type: Types.RestaurantType, isFeatured: boolean, sortOrder: number, isActive: boolean, createdAt: string, updatedAt: string }>, pageInfo: { totalItems: number, totalPages: number, currentPage: number, hasNextPage: boolean, hasPreviousPage: boolean } } };

export type RestaurantQueryVariables = Exact<{
  id: string | number;
}>;


export type RestaurantQuery = { restaurant: { id: string, name: string, description: string | null, address: string, city: string, zipCode: string, phone: string, cuisineType: string, imageUrl: string | null, coverImageUrl: string | null, rating: number, deliveryFee: number, estimatedDeliveryTime: number, latitude: number | null, longitude: number | null, type: Types.RestaurantType, isFeatured: boolean, sortOrder: number, isActive: boolean, createdAt: string, updatedAt: string } };

export type SearchMenuItemsQueryVariables = Exact<{
  page?: number | null | undefined;
  limit?: number | null | undefined;
  input?: Types.SearchMenuItemsInput | null | undefined;
}>;


export type SearchMenuItemsQuery = { searchMenuItems: { items: Array<{ id: string, name: string, description: string | null, price: number, category: Types.MenuItemCategory, imageUrl: string | null, isAvailable: boolean, seller: string | null, badge: string | null, isFeatured: boolean, sortOrder: number, kind: Types.MenuItemKind, marketCategoryId: string | null, restaurantId: string | null, createdAt: string, updatedAt: string, marketCategory: { id: string, label: string, subtitle: string | null, imageUrl: string | null, icon: string, iconLib: string, tint: string, iconColor: string } | null, supplements: Array<{ id: string, name: string, price: number, isAvailable: boolean, sortOrder: number }> }>, pageInfo: { totalItems: number, totalPages: number } } };

export type MenuItemsByRestaurantQueryVariables = Exact<{
  restaurantId: string | number;
  page?: number | null | undefined;
  limit?: number | null | undefined;
}>;


export type MenuItemsByRestaurantQuery = { menuItemsByRestaurant: { items: Array<{ id: string, name: string, description: string | null, price: number, category: Types.MenuItemCategory, imageUrl: string | null, isAvailable: boolean, seller: string | null, badge: string | null, isFeatured: boolean, sortOrder: number, kind: Types.MenuItemKind, marketCategoryId: string | null, restaurantId: string | null, createdAt: string, updatedAt: string, marketCategory: { id: string, label: string, subtitle: string | null, imageUrl: string | null, icon: string, iconLib: string, tint: string, iconColor: string } | null, supplements: Array<{ id: string, name: string, price: number, isAvailable: boolean, sortOrder: number }> }>, pageInfo: { totalItems: number, totalPages: number } } };

export type TrackingByDeliveryQueryVariables = Exact<{
  deliveryId: string | number;
}>;


export type TrackingByDeliveryQuery = { trackingByDelivery: Array<{ id: string, status: Types.DeliveryStatus, message: string | null, latitude: number | null, longitude: number | null, createdAt: string }> };

export type RegisterPushTokenMutationVariables = Exact<{
  token: string;
}>;


export type RegisterPushTokenMutation = { registerPushToken: { id: string } };


export const LoginDocument = gql`
    mutation Login($input: LoginInput!) {
  login(input: $input) {
    accessToken
    user {
      id
      email
      firstName
      lastName
      phone
      role
      avatarUrl
      createdAt
      updatedAt
    }
  }
}
    `;
export type LoginMutationFn = ApolloReactCommon.MutationFunction<LoginMutation, LoginMutationVariables>;

/**
 * __useLoginMutation__
 *
 * To run a mutation, you first call `useLoginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLoginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [loginMutation, { data, loading, error }] = useLoginMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useLoginMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<LoginMutation, LoginMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument, options);
      }
export type LoginMutationHookResult = ReturnType<typeof useLoginMutation>;
export type LoginMutationResult = ApolloReactCommon.MutationResult<LoginMutation>;
export type LoginMutationOptions = ApolloReactCommon.BaseMutationOptions<LoginMutation, LoginMutationVariables>;
export const RegisterDocument = gql`
    mutation Register($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    email
    firstName
    lastName
    role
    phone
  }
}
    `;
export type RegisterMutationFn = ApolloReactCommon.MutationFunction<RegisterMutation, RegisterMutationVariables>;

/**
 * __useRegisterMutation__
 *
 * To run a mutation, you first call `useRegisterMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRegisterMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [registerMutation, { data, loading, error }] = useRegisterMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRegisterMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<RegisterMutation, RegisterMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<RegisterMutation, RegisterMutationVariables>(RegisterDocument, options);
      }
export type RegisterMutationHookResult = ReturnType<typeof useRegisterMutation>;
export type RegisterMutationResult = ApolloReactCommon.MutationResult<RegisterMutation>;
export type RegisterMutationOptions = ApolloReactCommon.BaseMutationOptions<RegisterMutation, RegisterMutationVariables>;
export const RequestOtpDocument = gql`
    mutation RequestOtp($input: RequestOtpInput!) {
  requestOtp(input: $input) {
    phone
    expiresIn
    devCode
  }
}
    `;
export type RequestOtpMutationFn = ApolloReactCommon.MutationFunction<RequestOtpMutation, RequestOtpMutationVariables>;

/**
 * __useRequestOtpMutation__
 *
 * To run a mutation, you first call `useRequestOtpMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRequestOtpMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [requestOtpMutation, { data, loading, error }] = useRequestOtpMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRequestOtpMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<RequestOtpMutation, RequestOtpMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<RequestOtpMutation, RequestOtpMutationVariables>(RequestOtpDocument, options);
      }
export type RequestOtpMutationHookResult = ReturnType<typeof useRequestOtpMutation>;
export type RequestOtpMutationResult = ApolloReactCommon.MutationResult<RequestOtpMutation>;
export type RequestOtpMutationOptions = ApolloReactCommon.BaseMutationOptions<RequestOtpMutation, RequestOtpMutationVariables>;
export const VerifyOtpDocument = gql`
    mutation VerifyOtp($input: VerifyOtpInput!) {
  verifyOtp(input: $input)
}
    `;
export type VerifyOtpMutationFn = ApolloReactCommon.MutationFunction<VerifyOtpMutation, VerifyOtpMutationVariables>;

/**
 * __useVerifyOtpMutation__
 *
 * To run a mutation, you first call `useVerifyOtpMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useVerifyOtpMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [verifyOtpMutation, { data, loading, error }] = useVerifyOtpMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useVerifyOtpMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<VerifyOtpMutation, VerifyOtpMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<VerifyOtpMutation, VerifyOtpMutationVariables>(VerifyOtpDocument, options);
      }
export type VerifyOtpMutationHookResult = ReturnType<typeof useVerifyOtpMutation>;
export type VerifyOtpMutationResult = ApolloReactCommon.MutationResult<VerifyOtpMutation>;
export type VerifyOtpMutationOptions = ApolloReactCommon.BaseMutationOptions<VerifyOtpMutation, VerifyOtpMutationVariables>;
export const UpdateProfileDocument = gql`
    mutation UpdateProfile($input: UpdateProfileInput!) {
  updateProfile(input: $input) {
    id
    firstName
    lastName
    phone
    avatarUrl
    role
    email
    createdAt
    updatedAt
  }
}
    `;
export type UpdateProfileMutationFn = ApolloReactCommon.MutationFunction<UpdateProfileMutation, UpdateProfileMutationVariables>;

/**
 * __useUpdateProfileMutation__
 *
 * To run a mutation, you first call `useUpdateProfileMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateProfileMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateProfileMutation, { data, loading, error }] = useUpdateProfileMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateProfileMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UpdateProfileMutation, UpdateProfileMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<UpdateProfileMutation, UpdateProfileMutationVariables>(UpdateProfileDocument, options);
      }
export type UpdateProfileMutationHookResult = ReturnType<typeof useUpdateProfileMutation>;
export type UpdateProfileMutationResult = ApolloReactCommon.MutationResult<UpdateProfileMutation>;
export type UpdateProfileMutationOptions = ApolloReactCommon.BaseMutationOptions<UpdateProfileMutation, UpdateProfileMutationVariables>;
export const ResetPasswordDocument = gql`
    mutation ResetPassword($input: ResetPasswordInput!) {
  resetPassword(input: $input)
}
    `;
export type ResetPasswordMutationFn = ApolloReactCommon.MutationFunction<ResetPasswordMutation, ResetPasswordMutationVariables>;

/**
 * __useResetPasswordMutation__
 *
 * To run a mutation, you first call `useResetPasswordMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useResetPasswordMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [resetPasswordMutation, { data, loading, error }] = useResetPasswordMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useResetPasswordMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<ResetPasswordMutation, ResetPasswordMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<ResetPasswordMutation, ResetPasswordMutationVariables>(ResetPasswordDocument, options);
      }
export type ResetPasswordMutationHookResult = ReturnType<typeof useResetPasswordMutation>;
export type ResetPasswordMutationResult = ApolloReactCommon.MutationResult<ResetPasswordMutation>;
export type ResetPasswordMutationOptions = ApolloReactCommon.BaseMutationOptions<ResetPasswordMutation, ResetPasswordMutationVariables>;
export const DeleteMyAccountDocument = gql`
    mutation DeleteMyAccount {
  deleteMyAccount {
    id
  }
}
    `;
export type DeleteMyAccountMutationFn = ApolloReactCommon.MutationFunction<DeleteMyAccountMutation, DeleteMyAccountMutationVariables>;

/**
 * __useDeleteMyAccountMutation__
 *
 * To run a mutation, you first call `useDeleteMyAccountMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteMyAccountMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteMyAccountMutation, { data, loading, error }] = useDeleteMyAccountMutation({
 *   variables: {
 *   },
 * });
 */
export function useDeleteMyAccountMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<DeleteMyAccountMutation, DeleteMyAccountMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<DeleteMyAccountMutation, DeleteMyAccountMutationVariables>(DeleteMyAccountDocument, options);
      }
export type DeleteMyAccountMutationHookResult = ReturnType<typeof useDeleteMyAccountMutation>;
export type DeleteMyAccountMutationResult = ApolloReactCommon.MutationResult<DeleteMyAccountMutation>;
export type DeleteMyAccountMutationOptions = ApolloReactCommon.BaseMutationOptions<DeleteMyAccountMutation, DeleteMyAccountMutationVariables>;
export const MeDocument = gql`
    query Me {
  me {
    id
    email
    firstName
    lastName
    phone
    role
    avatarUrl
  }
}
    `;

/**
 * __useMeQuery__
 *
 * To run a query within a React component, call `useMeQuery` and pass it any options that fit your needs.
 * When your component renders, `useMeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMeQuery({
 *   variables: {
 *   },
 * });
 */
export function useMeQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<MeQuery, MeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<MeQuery, MeQueryVariables>(MeDocument, options);
      }
export function useMeLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<MeQuery, MeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<MeQuery, MeQueryVariables>(MeDocument, options);
        }
// @ts-ignore
export function useMeSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<MeQuery, MeQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<MeQuery, MeQueryVariables>;
export function useMeSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<MeQuery, MeQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<MeQuery | undefined, MeQueryVariables>;
export function useMeSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<MeQuery, MeQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<MeQuery, MeQueryVariables>(MeDocument, options);
        }
export type MeQueryHookResult = ReturnType<typeof useMeQuery>;
export type MeLazyQueryHookResult = ReturnType<typeof useMeLazyQuery>;
export type MeSuspenseQueryHookResult = ReturnType<typeof useMeSuspenseQuery>;
export type MeQueryResult = ApolloReactCommon.QueryResult<MeQuery, MeQueryVariables>;
export const ActiveHomeBannersDocument = gql`
    query ActiveHomeBanners {
  activeHomeBanners {
    id
    title
    subtitle
    imageUrl
    ctaLabel
    linkType
    linkValue
    sortOrder
    isActive
  }
}
    `;

/**
 * __useActiveHomeBannersQuery__
 *
 * To run a query within a React component, call `useActiveHomeBannersQuery` and pass it any options that fit your needs.
 * When your component renders, `useActiveHomeBannersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useActiveHomeBannersQuery({
 *   variables: {
 *   },
 * });
 */
export function useActiveHomeBannersQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<ActiveHomeBannersQuery, ActiveHomeBannersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<ActiveHomeBannersQuery, ActiveHomeBannersQueryVariables>(ActiveHomeBannersDocument, options);
      }
export function useActiveHomeBannersLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<ActiveHomeBannersQuery, ActiveHomeBannersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<ActiveHomeBannersQuery, ActiveHomeBannersQueryVariables>(ActiveHomeBannersDocument, options);
        }
// @ts-ignore
export function useActiveHomeBannersSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<ActiveHomeBannersQuery, ActiveHomeBannersQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<ActiveHomeBannersQuery, ActiveHomeBannersQueryVariables>;
export function useActiveHomeBannersSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<ActiveHomeBannersQuery, ActiveHomeBannersQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<ActiveHomeBannersQuery | undefined, ActiveHomeBannersQueryVariables>;
export function useActiveHomeBannersSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<ActiveHomeBannersQuery, ActiveHomeBannersQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<ActiveHomeBannersQuery, ActiveHomeBannersQueryVariables>(ActiveHomeBannersDocument, options);
        }
export type ActiveHomeBannersQueryHookResult = ReturnType<typeof useActiveHomeBannersQuery>;
export type ActiveHomeBannersLazyQueryHookResult = ReturnType<typeof useActiveHomeBannersLazyQuery>;
export type ActiveHomeBannersSuspenseQueryHookResult = ReturnType<typeof useActiveHomeBannersSuspenseQuery>;
export type ActiveHomeBannersQueryResult = ApolloReactCommon.QueryResult<ActiveHomeBannersQuery, ActiveHomeBannersQueryVariables>;
export const ActiveMarketCategoriesDocument = gql`
    query ActiveMarketCategories {
  activeMarketCategories {
    id
    label
    subtitle
    imageUrl
    icon
    iconLib
    tint
    iconColor
    sortOrder
    isActive
  }
}
    `;

/**
 * __useActiveMarketCategoriesQuery__
 *
 * To run a query within a React component, call `useActiveMarketCategoriesQuery` and pass it any options that fit your needs.
 * When your component renders, `useActiveMarketCategoriesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useActiveMarketCategoriesQuery({
 *   variables: {
 *   },
 * });
 */
export function useActiveMarketCategoriesQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<ActiveMarketCategoriesQuery, ActiveMarketCategoriesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<ActiveMarketCategoriesQuery, ActiveMarketCategoriesQueryVariables>(ActiveMarketCategoriesDocument, options);
      }
export function useActiveMarketCategoriesLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<ActiveMarketCategoriesQuery, ActiveMarketCategoriesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<ActiveMarketCategoriesQuery, ActiveMarketCategoriesQueryVariables>(ActiveMarketCategoriesDocument, options);
        }
// @ts-ignore
export function useActiveMarketCategoriesSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<ActiveMarketCategoriesQuery, ActiveMarketCategoriesQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<ActiveMarketCategoriesQuery, ActiveMarketCategoriesQueryVariables>;
export function useActiveMarketCategoriesSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<ActiveMarketCategoriesQuery, ActiveMarketCategoriesQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<ActiveMarketCategoriesQuery | undefined, ActiveMarketCategoriesQueryVariables>;
export function useActiveMarketCategoriesSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<ActiveMarketCategoriesQuery, ActiveMarketCategoriesQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<ActiveMarketCategoriesQuery, ActiveMarketCategoriesQueryVariables>(ActiveMarketCategoriesDocument, options);
        }
export type ActiveMarketCategoriesQueryHookResult = ReturnType<typeof useActiveMarketCategoriesQuery>;
export type ActiveMarketCategoriesLazyQueryHookResult = ReturnType<typeof useActiveMarketCategoriesLazyQuery>;
export type ActiveMarketCategoriesSuspenseQueryHookResult = ReturnType<typeof useActiveMarketCategoriesSuspenseQuery>;
export type ActiveMarketCategoriesQueryResult = ApolloReactCommon.QueryResult<ActiveMarketCategoriesQuery, ActiveMarketCategoriesQueryVariables>;
export const ActiveCuisineTypesDocument = gql`
    query ActiveCuisineTypes {
  activeCuisineTypes {
    id
    value
    label
    emoji
    iconUrl
    sortOrder
    isActive
  }
}
    `;

/**
 * __useActiveCuisineTypesQuery__
 *
 * To run a query within a React component, call `useActiveCuisineTypesQuery` and pass it any options that fit your needs.
 * When your component renders, `useActiveCuisineTypesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useActiveCuisineTypesQuery({
 *   variables: {
 *   },
 * });
 */
export function useActiveCuisineTypesQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<ActiveCuisineTypesQuery, ActiveCuisineTypesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<ActiveCuisineTypesQuery, ActiveCuisineTypesQueryVariables>(ActiveCuisineTypesDocument, options);
      }
export function useActiveCuisineTypesLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<ActiveCuisineTypesQuery, ActiveCuisineTypesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<ActiveCuisineTypesQuery, ActiveCuisineTypesQueryVariables>(ActiveCuisineTypesDocument, options);
        }
// @ts-ignore
export function useActiveCuisineTypesSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<ActiveCuisineTypesQuery, ActiveCuisineTypesQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<ActiveCuisineTypesQuery, ActiveCuisineTypesQueryVariables>;
export function useActiveCuisineTypesSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<ActiveCuisineTypesQuery, ActiveCuisineTypesQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<ActiveCuisineTypesQuery | undefined, ActiveCuisineTypesQueryVariables>;
export function useActiveCuisineTypesSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<ActiveCuisineTypesQuery, ActiveCuisineTypesQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<ActiveCuisineTypesQuery, ActiveCuisineTypesQueryVariables>(ActiveCuisineTypesDocument, options);
        }
export type ActiveCuisineTypesQueryHookResult = ReturnType<typeof useActiveCuisineTypesQuery>;
export type ActiveCuisineTypesLazyQueryHookResult = ReturnType<typeof useActiveCuisineTypesLazyQuery>;
export type ActiveCuisineTypesSuspenseQueryHookResult = ReturnType<typeof useActiveCuisineTypesSuspenseQuery>;
export type ActiveCuisineTypesQueryResult = ApolloReactCommon.QueryResult<ActiveCuisineTypesQuery, ActiveCuisineTypesQueryVariables>;
export const MarketRestaurantDocument = gql`
    query MarketRestaurant {
  marketRestaurant {
    id
    name
    deliveryFee
    estimatedDeliveryTime
    isActive
  }
}
    `;

/**
 * __useMarketRestaurantQuery__
 *
 * To run a query within a React component, call `useMarketRestaurantQuery` and pass it any options that fit your needs.
 * When your component renders, `useMarketRestaurantQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMarketRestaurantQuery({
 *   variables: {
 *   },
 * });
 */
export function useMarketRestaurantQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<MarketRestaurantQuery, MarketRestaurantQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<MarketRestaurantQuery, MarketRestaurantQueryVariables>(MarketRestaurantDocument, options);
      }
export function useMarketRestaurantLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<MarketRestaurantQuery, MarketRestaurantQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<MarketRestaurantQuery, MarketRestaurantQueryVariables>(MarketRestaurantDocument, options);
        }
// @ts-ignore
export function useMarketRestaurantSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<MarketRestaurantQuery, MarketRestaurantQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<MarketRestaurantQuery, MarketRestaurantQueryVariables>;
export function useMarketRestaurantSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<MarketRestaurantQuery, MarketRestaurantQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<MarketRestaurantQuery | undefined, MarketRestaurantQueryVariables>;
export function useMarketRestaurantSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<MarketRestaurantQuery, MarketRestaurantQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<MarketRestaurantQuery, MarketRestaurantQueryVariables>(MarketRestaurantDocument, options);
        }
export type MarketRestaurantQueryHookResult = ReturnType<typeof useMarketRestaurantQuery>;
export type MarketRestaurantLazyQueryHookResult = ReturnType<typeof useMarketRestaurantLazyQuery>;
export type MarketRestaurantSuspenseQueryHookResult = ReturnType<typeof useMarketRestaurantSuspenseQuery>;
export type MarketRestaurantQueryResult = ApolloReactCommon.QueryResult<MarketRestaurantQuery, MarketRestaurantQueryVariables>;
export const AvailableDriversDocument = gql`
    query AvailableDrivers {
  availableDrivers {
    id
    userId
    vehicleType
    isAvailable
    rating
    reviewCount
    user {
      id
      firstName
      lastName
      phone
    }
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useAvailableDriversQuery__
 *
 * To run a query within a React component, call `useAvailableDriversQuery` and pass it any options that fit your needs.
 * When your component renders, `useAvailableDriversQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAvailableDriversQuery({
 *   variables: {
 *   },
 * });
 */
export function useAvailableDriversQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<AvailableDriversQuery, AvailableDriversQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<AvailableDriversQuery, AvailableDriversQueryVariables>(AvailableDriversDocument, options);
      }
export function useAvailableDriversLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<AvailableDriversQuery, AvailableDriversQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<AvailableDriversQuery, AvailableDriversQueryVariables>(AvailableDriversDocument, options);
        }
// @ts-ignore
export function useAvailableDriversSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<AvailableDriversQuery, AvailableDriversQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<AvailableDriversQuery, AvailableDriversQueryVariables>;
export function useAvailableDriversSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<AvailableDriversQuery, AvailableDriversQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<AvailableDriversQuery | undefined, AvailableDriversQueryVariables>;
export function useAvailableDriversSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<AvailableDriversQuery, AvailableDriversQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<AvailableDriversQuery, AvailableDriversQueryVariables>(AvailableDriversDocument, options);
        }
export type AvailableDriversQueryHookResult = ReturnType<typeof useAvailableDriversQuery>;
export type AvailableDriversLazyQueryHookResult = ReturnType<typeof useAvailableDriversLazyQuery>;
export type AvailableDriversSuspenseQueryHookResult = ReturnType<typeof useAvailableDriversSuspenseQuery>;
export type AvailableDriversQueryResult = ApolloReactCommon.QueryResult<AvailableDriversQuery, AvailableDriversQueryVariables>;
export const DriverDocument = gql`
    query Driver($id: ID!) {
  driver(id: $id) {
    id
    userId
    vehicleType
    isAvailable
    rating
    reviewCount
    user {
      id
      firstName
      lastName
      phone
    }
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useDriverQuery__
 *
 * To run a query within a React component, call `useDriverQuery` and pass it any options that fit your needs.
 * When your component renders, `useDriverQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDriverQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDriverQuery(baseOptions: ApolloReactHooks.QueryHookOptions<DriverQuery, DriverQueryVariables> & ({ variables: DriverQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<DriverQuery, DriverQueryVariables>(DriverDocument, options);
      }
export function useDriverLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<DriverQuery, DriverQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<DriverQuery, DriverQueryVariables>(DriverDocument, options);
        }
// @ts-ignore
export function useDriverSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<DriverQuery, DriverQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<DriverQuery, DriverQueryVariables>;
export function useDriverSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<DriverQuery, DriverQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<DriverQuery | undefined, DriverQueryVariables>;
export function useDriverSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<DriverQuery, DriverQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<DriverQuery, DriverQueryVariables>(DriverDocument, options);
        }
export type DriverQueryHookResult = ReturnType<typeof useDriverQuery>;
export type DriverLazyQueryHookResult = ReturnType<typeof useDriverLazyQuery>;
export type DriverSuspenseQueryHookResult = ReturnType<typeof useDriverSuspenseQuery>;
export type DriverQueryResult = ApolloReactCommon.QueryResult<DriverQuery, DriverQueryVariables>;
export const MyFavoritesDocument = gql`
    query MyFavorites {
  myFavorites {
    id
    targetId
    kind
    name
    imageUrl
    price
    seller
    cuisineType
    rating
    city
    createdAt
  }
}
    `;

/**
 * __useMyFavoritesQuery__
 *
 * To run a query within a React component, call `useMyFavoritesQuery` and pass it any options that fit your needs.
 * When your component renders, `useMyFavoritesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMyFavoritesQuery({
 *   variables: {
 *   },
 * });
 */
export function useMyFavoritesQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<MyFavoritesQuery, MyFavoritesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<MyFavoritesQuery, MyFavoritesQueryVariables>(MyFavoritesDocument, options);
      }
export function useMyFavoritesLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<MyFavoritesQuery, MyFavoritesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<MyFavoritesQuery, MyFavoritesQueryVariables>(MyFavoritesDocument, options);
        }
// @ts-ignore
export function useMyFavoritesSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<MyFavoritesQuery, MyFavoritesQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<MyFavoritesQuery, MyFavoritesQueryVariables>;
export function useMyFavoritesSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<MyFavoritesQuery, MyFavoritesQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<MyFavoritesQuery | undefined, MyFavoritesQueryVariables>;
export function useMyFavoritesSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<MyFavoritesQuery, MyFavoritesQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<MyFavoritesQuery, MyFavoritesQueryVariables>(MyFavoritesDocument, options);
        }
export type MyFavoritesQueryHookResult = ReturnType<typeof useMyFavoritesQuery>;
export type MyFavoritesLazyQueryHookResult = ReturnType<typeof useMyFavoritesLazyQuery>;
export type MyFavoritesSuspenseQueryHookResult = ReturnType<typeof useMyFavoritesSuspenseQuery>;
export type MyFavoritesQueryResult = ApolloReactCommon.QueryResult<MyFavoritesQuery, MyFavoritesQueryVariables>;
export const ToggleFavoriteDocument = gql`
    mutation ToggleFavorite($input: ToggleFavoriteInput!) {
  toggleFavorite(input: $input) {
    id
    targetId
    kind
    name
    imageUrl
    price
    seller
    cuisineType
    rating
    city
    createdAt
  }
}
    `;
export type ToggleFavoriteMutationFn = ApolloReactCommon.MutationFunction<ToggleFavoriteMutation, ToggleFavoriteMutationVariables>;

/**
 * __useToggleFavoriteMutation__
 *
 * To run a mutation, you first call `useToggleFavoriteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useToggleFavoriteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [toggleFavoriteMutation, { data, loading, error }] = useToggleFavoriteMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useToggleFavoriteMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<ToggleFavoriteMutation, ToggleFavoriteMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<ToggleFavoriteMutation, ToggleFavoriteMutationVariables>(ToggleFavoriteDocument, options);
      }
export type ToggleFavoriteMutationHookResult = ReturnType<typeof useToggleFavoriteMutation>;
export type ToggleFavoriteMutationResult = ApolloReactCommon.MutationResult<ToggleFavoriteMutation>;
export type ToggleFavoriteMutationOptions = ApolloReactCommon.BaseMutationOptions<ToggleFavoriteMutation, ToggleFavoriteMutationVariables>;
export const RemoveFavoriteDocument = gql`
    mutation RemoveFavorite($targetId: String!, $kind: FavoriteKind!) {
  removeFavorite(targetId: $targetId, kind: $kind)
}
    `;
export type RemoveFavoriteMutationFn = ApolloReactCommon.MutationFunction<RemoveFavoriteMutation, RemoveFavoriteMutationVariables>;

/**
 * __useRemoveFavoriteMutation__
 *
 * To run a mutation, you first call `useRemoveFavoriteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveFavoriteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeFavoriteMutation, { data, loading, error }] = useRemoveFavoriteMutation({
 *   variables: {
 *      targetId: // value for 'targetId'
 *      kind: // value for 'kind'
 *   },
 * });
 */
export function useRemoveFavoriteMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<RemoveFavoriteMutation, RemoveFavoriteMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<RemoveFavoriteMutation, RemoveFavoriteMutationVariables>(RemoveFavoriteDocument, options);
      }
export type RemoveFavoriteMutationHookResult = ReturnType<typeof useRemoveFavoriteMutation>;
export type RemoveFavoriteMutationResult = ApolloReactCommon.MutationResult<RemoveFavoriteMutation>;
export type RemoveFavoriteMutationOptions = ApolloReactCommon.BaseMutationOptions<RemoveFavoriteMutation, RemoveFavoriteMutationVariables>;
export const TrackDeliveryDocument = gql`
    query TrackDelivery($orderId: ID!) {
  trackDelivery(orderId: $orderId) {
    id
    driverId
    latitude
    longitude
    updatedAt
  }
}
    `;

/**
 * __useTrackDeliveryQuery__
 *
 * To run a query within a React component, call `useTrackDeliveryQuery` and pass it any options that fit your needs.
 * When your component renders, `useTrackDeliveryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTrackDeliveryQuery({
 *   variables: {
 *      orderId: // value for 'orderId'
 *   },
 * });
 */
export function useTrackDeliveryQuery(baseOptions: ApolloReactHooks.QueryHookOptions<TrackDeliveryQuery, TrackDeliveryQueryVariables> & ({ variables: TrackDeliveryQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<TrackDeliveryQuery, TrackDeliveryQueryVariables>(TrackDeliveryDocument, options);
      }
export function useTrackDeliveryLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<TrackDeliveryQuery, TrackDeliveryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<TrackDeliveryQuery, TrackDeliveryQueryVariables>(TrackDeliveryDocument, options);
        }
// @ts-ignore
export function useTrackDeliverySuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<TrackDeliveryQuery, TrackDeliveryQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<TrackDeliveryQuery, TrackDeliveryQueryVariables>;
export function useTrackDeliverySuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<TrackDeliveryQuery, TrackDeliveryQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<TrackDeliveryQuery | undefined, TrackDeliveryQueryVariables>;
export function useTrackDeliverySuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<TrackDeliveryQuery, TrackDeliveryQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<TrackDeliveryQuery, TrackDeliveryQueryVariables>(TrackDeliveryDocument, options);
        }
export type TrackDeliveryQueryHookResult = ReturnType<typeof useTrackDeliveryQuery>;
export type TrackDeliveryLazyQueryHookResult = ReturnType<typeof useTrackDeliveryLazyQuery>;
export type TrackDeliverySuspenseQueryHookResult = ReturnType<typeof useTrackDeliverySuspenseQuery>;
export type TrackDeliveryQueryResult = ApolloReactCommon.QueryResult<TrackDeliveryQuery, TrackDeliveryQueryVariables>;
export const MyNotificationsDocument = gql`
    query MyNotifications($page: Int = 1, $limit: Int = 20) {
  myNotifications(page: $page, limit: $limit) {
    items {
      id
      type
      title
      message
      readAt
      createdAt
    }
    pageInfo {
      totalItems
    }
  }
}
    `;

/**
 * __useMyNotificationsQuery__
 *
 * To run a query within a React component, call `useMyNotificationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useMyNotificationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMyNotificationsQuery({
 *   variables: {
 *      page: // value for 'page'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useMyNotificationsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<MyNotificationsQuery, MyNotificationsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<MyNotificationsQuery, MyNotificationsQueryVariables>(MyNotificationsDocument, options);
      }
export function useMyNotificationsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<MyNotificationsQuery, MyNotificationsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<MyNotificationsQuery, MyNotificationsQueryVariables>(MyNotificationsDocument, options);
        }
// @ts-ignore
export function useMyNotificationsSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<MyNotificationsQuery, MyNotificationsQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<MyNotificationsQuery, MyNotificationsQueryVariables>;
export function useMyNotificationsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<MyNotificationsQuery, MyNotificationsQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<MyNotificationsQuery | undefined, MyNotificationsQueryVariables>;
export function useMyNotificationsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<MyNotificationsQuery, MyNotificationsQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<MyNotificationsQuery, MyNotificationsQueryVariables>(MyNotificationsDocument, options);
        }
export type MyNotificationsQueryHookResult = ReturnType<typeof useMyNotificationsQuery>;
export type MyNotificationsLazyQueryHookResult = ReturnType<typeof useMyNotificationsLazyQuery>;
export type MyNotificationsSuspenseQueryHookResult = ReturnType<typeof useMyNotificationsSuspenseQuery>;
export type MyNotificationsQueryResult = ApolloReactCommon.QueryResult<MyNotificationsQuery, MyNotificationsQueryVariables>;
export const UnreadNotificationsCountDocument = gql`
    query UnreadNotificationsCount {
  unreadNotificationsCount
}
    `;

/**
 * __useUnreadNotificationsCountQuery__
 *
 * To run a query within a React component, call `useUnreadNotificationsCountQuery` and pass it any options that fit your needs.
 * When your component renders, `useUnreadNotificationsCountQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUnreadNotificationsCountQuery({
 *   variables: {
 *   },
 * });
 */
export function useUnreadNotificationsCountQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<UnreadNotificationsCountQuery, UnreadNotificationsCountQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<UnreadNotificationsCountQuery, UnreadNotificationsCountQueryVariables>(UnreadNotificationsCountDocument, options);
      }
export function useUnreadNotificationsCountLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<UnreadNotificationsCountQuery, UnreadNotificationsCountQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<UnreadNotificationsCountQuery, UnreadNotificationsCountQueryVariables>(UnreadNotificationsCountDocument, options);
        }
// @ts-ignore
export function useUnreadNotificationsCountSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<UnreadNotificationsCountQuery, UnreadNotificationsCountQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<UnreadNotificationsCountQuery, UnreadNotificationsCountQueryVariables>;
export function useUnreadNotificationsCountSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<UnreadNotificationsCountQuery, UnreadNotificationsCountQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<UnreadNotificationsCountQuery | undefined, UnreadNotificationsCountQueryVariables>;
export function useUnreadNotificationsCountSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<UnreadNotificationsCountQuery, UnreadNotificationsCountQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<UnreadNotificationsCountQuery, UnreadNotificationsCountQueryVariables>(UnreadNotificationsCountDocument, options);
        }
export type UnreadNotificationsCountQueryHookResult = ReturnType<typeof useUnreadNotificationsCountQuery>;
export type UnreadNotificationsCountLazyQueryHookResult = ReturnType<typeof useUnreadNotificationsCountLazyQuery>;
export type UnreadNotificationsCountSuspenseQueryHookResult = ReturnType<typeof useUnreadNotificationsCountSuspenseQuery>;
export type UnreadNotificationsCountQueryResult = ApolloReactCommon.QueryResult<UnreadNotificationsCountQuery, UnreadNotificationsCountQueryVariables>;
export const MarkNotificationAsReadDocument = gql`
    mutation MarkNotificationAsRead($input: MarkNotificationReadInput!) {
  markNotificationAsRead(input: $input) {
    id
    readAt
  }
}
    `;
export type MarkNotificationAsReadMutationFn = ApolloReactCommon.MutationFunction<MarkNotificationAsReadMutation, MarkNotificationAsReadMutationVariables>;

/**
 * __useMarkNotificationAsReadMutation__
 *
 * To run a mutation, you first call `useMarkNotificationAsReadMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMarkNotificationAsReadMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [markNotificationAsReadMutation, { data, loading, error }] = useMarkNotificationAsReadMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useMarkNotificationAsReadMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<MarkNotificationAsReadMutation, MarkNotificationAsReadMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<MarkNotificationAsReadMutation, MarkNotificationAsReadMutationVariables>(MarkNotificationAsReadDocument, options);
      }
export type MarkNotificationAsReadMutationHookResult = ReturnType<typeof useMarkNotificationAsReadMutation>;
export type MarkNotificationAsReadMutationResult = ApolloReactCommon.MutationResult<MarkNotificationAsReadMutation>;
export type MarkNotificationAsReadMutationOptions = ApolloReactCommon.BaseMutationOptions<MarkNotificationAsReadMutation, MarkNotificationAsReadMutationVariables>;
export const MarkAllNotificationsAsReadDocument = gql`
    mutation MarkAllNotificationsAsRead {
  markAllNotificationsAsRead
}
    `;
export type MarkAllNotificationsAsReadMutationFn = ApolloReactCommon.MutationFunction<MarkAllNotificationsAsReadMutation, MarkAllNotificationsAsReadMutationVariables>;

/**
 * __useMarkAllNotificationsAsReadMutation__
 *
 * To run a mutation, you first call `useMarkAllNotificationsAsReadMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMarkAllNotificationsAsReadMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [markAllNotificationsAsReadMutation, { data, loading, error }] = useMarkAllNotificationsAsReadMutation({
 *   variables: {
 *   },
 * });
 */
export function useMarkAllNotificationsAsReadMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<MarkAllNotificationsAsReadMutation, MarkAllNotificationsAsReadMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<MarkAllNotificationsAsReadMutation, MarkAllNotificationsAsReadMutationVariables>(MarkAllNotificationsAsReadDocument, options);
      }
export type MarkAllNotificationsAsReadMutationHookResult = ReturnType<typeof useMarkAllNotificationsAsReadMutation>;
export type MarkAllNotificationsAsReadMutationResult = ApolloReactCommon.MutationResult<MarkAllNotificationsAsReadMutation>;
export type MarkAllNotificationsAsReadMutationOptions = ApolloReactCommon.BaseMutationOptions<MarkAllNotificationsAsReadMutation, MarkAllNotificationsAsReadMutationVariables>;
export const CreateOrderDocument = gql`
    mutation CreateOrder($input: CreateOrderInput!) {
  createOrder(input: $input) {
    id
    status
    total
    deliveryFee
    grandTotal
    deliveryAddress
    deliveryCity
    deliveryZipCode
    deliveryLatitude
    deliveryLongitude
    createdAt
    payment {
      method
      status
      amount
    }
    restaurant {
      id
      name
      imageUrl
    }
    items {
      quantity
      unitPrice
      menuItem {
        id
        name
        price
      }
    }
  }
}
    `;
export type CreateOrderMutationFn = ApolloReactCommon.MutationFunction<CreateOrderMutation, CreateOrderMutationVariables>;

/**
 * __useCreateOrderMutation__
 *
 * To run a mutation, you first call `useCreateOrderMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateOrderMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createOrderMutation, { data, loading, error }] = useCreateOrderMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateOrderMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateOrderMutation, CreateOrderMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CreateOrderMutation, CreateOrderMutationVariables>(CreateOrderDocument, options);
      }
export type CreateOrderMutationHookResult = ReturnType<typeof useCreateOrderMutation>;
export type CreateOrderMutationResult = ApolloReactCommon.MutationResult<CreateOrderMutation>;
export type CreateOrderMutationOptions = ApolloReactCommon.BaseMutationOptions<CreateOrderMutation, CreateOrderMutationVariables>;
export const MyOrdersDocument = gql`
    query MyOrders($page: Int = 1, $limit: Int = 10) {
  myOrders(page: $page, limit: $limit) {
    items {
      id
      status
      total
      deliveryFee
      grandTotal
      deliveryAddress
      deliveryCity
      createdAt
      restaurant {
        id
        name
        imageUrl
      }
      payment {
        method
        status
      }
      delivery {
        id
        status
        driver {
          id
          firstName
          lastName
          phone
        }
      }
    }
    pageInfo {
      totalItems
      totalPages
      currentPage
      hasNextPage
    }
  }
}
    `;

/**
 * __useMyOrdersQuery__
 *
 * To run a query within a React component, call `useMyOrdersQuery` and pass it any options that fit your needs.
 * When your component renders, `useMyOrdersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMyOrdersQuery({
 *   variables: {
 *      page: // value for 'page'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useMyOrdersQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<MyOrdersQuery, MyOrdersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<MyOrdersQuery, MyOrdersQueryVariables>(MyOrdersDocument, options);
      }
export function useMyOrdersLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<MyOrdersQuery, MyOrdersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<MyOrdersQuery, MyOrdersQueryVariables>(MyOrdersDocument, options);
        }
// @ts-ignore
export function useMyOrdersSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<MyOrdersQuery, MyOrdersQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<MyOrdersQuery, MyOrdersQueryVariables>;
export function useMyOrdersSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<MyOrdersQuery, MyOrdersQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<MyOrdersQuery | undefined, MyOrdersQueryVariables>;
export function useMyOrdersSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<MyOrdersQuery, MyOrdersQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<MyOrdersQuery, MyOrdersQueryVariables>(MyOrdersDocument, options);
        }
export type MyOrdersQueryHookResult = ReturnType<typeof useMyOrdersQuery>;
export type MyOrdersLazyQueryHookResult = ReturnType<typeof useMyOrdersLazyQuery>;
export type MyOrdersSuspenseQueryHookResult = ReturnType<typeof useMyOrdersSuspenseQuery>;
export type MyOrdersQueryResult = ApolloReactCommon.QueryResult<MyOrdersQuery, MyOrdersQueryVariables>;
export const OrderDocument = gql`
    query Order($id: ID!) {
  order(id: $id) {
    id
    status
    total
    deliveryFee
    grandTotal
    deliveryAddress
    deliveryCity
    deliveryZipCode
    deliveryLatitude
    deliveryLongitude
    createdAt
    restaurant {
      id
      name
      imageUrl
      phone
      latitude
      longitude
    }
    items {
      quantity
      unitPrice
      menuItem {
        id
        name
        price
      }
    }
    payment {
      method
      status
      amount
    }
    delivery {
      id
      status
      driver {
        id
        firstName
        lastName
        phone
      }
    }
  }
}
    `;

/**
 * __useOrderQuery__
 *
 * To run a query within a React component, call `useOrderQuery` and pass it any options that fit your needs.
 * When your component renders, `useOrderQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOrderQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useOrderQuery(baseOptions: ApolloReactHooks.QueryHookOptions<OrderQuery, OrderQueryVariables> & ({ variables: OrderQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<OrderQuery, OrderQueryVariables>(OrderDocument, options);
      }
export function useOrderLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<OrderQuery, OrderQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<OrderQuery, OrderQueryVariables>(OrderDocument, options);
        }
// @ts-ignore
export function useOrderSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<OrderQuery, OrderQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<OrderQuery, OrderQueryVariables>;
export function useOrderSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<OrderQuery, OrderQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<OrderQuery | undefined, OrderQueryVariables>;
export function useOrderSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<OrderQuery, OrderQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<OrderQuery, OrderQueryVariables>(OrderDocument, options);
        }
export type OrderQueryHookResult = ReturnType<typeof useOrderQuery>;
export type OrderLazyQueryHookResult = ReturnType<typeof useOrderLazyQuery>;
export type OrderSuspenseQueryHookResult = ReturnType<typeof useOrderSuspenseQuery>;
export type OrderQueryResult = ApolloReactCommon.QueryResult<OrderQuery, OrderQueryVariables>;
export const CancelOrderDocument = gql`
    mutation CancelOrder($id: ID!) {
  cancelOrder(id: $id) {
    id
    status
  }
}
    `;
export type CancelOrderMutationFn = ApolloReactCommon.MutationFunction<CancelOrderMutation, CancelOrderMutationVariables>;

/**
 * __useCancelOrderMutation__
 *
 * To run a mutation, you first call `useCancelOrderMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCancelOrderMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [cancelOrderMutation, { data, loading, error }] = useCancelOrderMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useCancelOrderMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CancelOrderMutation, CancelOrderMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CancelOrderMutation, CancelOrderMutationVariables>(CancelOrderDocument, options);
      }
export type CancelOrderMutationHookResult = ReturnType<typeof useCancelOrderMutation>;
export type CancelOrderMutationResult = ApolloReactCommon.MutationResult<CancelOrderMutation>;
export type CancelOrderMutationOptions = ApolloReactCommon.BaseMutationOptions<CancelOrderMutation, CancelOrderMutationVariables>;
export const CreateParcelDocument = gql`
    mutation CreateParcel($input: CreateParcelInput!) {
  createParcel(input: $input) {
    id
    status
    receiverName
    receiverPhone
    receiverAddress
    description
    weight
    createdAt
  }
}
    `;
export type CreateParcelMutationFn = ApolloReactCommon.MutationFunction<CreateParcelMutation, CreateParcelMutationVariables>;

/**
 * __useCreateParcelMutation__
 *
 * To run a mutation, you first call `useCreateParcelMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateParcelMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createParcelMutation, { data, loading, error }] = useCreateParcelMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateParcelMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateParcelMutation, CreateParcelMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CreateParcelMutation, CreateParcelMutationVariables>(CreateParcelDocument, options);
      }
export type CreateParcelMutationHookResult = ReturnType<typeof useCreateParcelMutation>;
export type CreateParcelMutationResult = ApolloReactCommon.MutationResult<CreateParcelMutation>;
export type CreateParcelMutationOptions = ApolloReactCommon.BaseMutationOptions<CreateParcelMutation, CreateParcelMutationVariables>;
export const MyParcelsDocument = gql`
    query MyParcels($page: Int = 1, $limit: Int = 20) {
  myParcels(page: $page, limit: $limit) {
    items {
      id
      status
      receiverName
      receiverPhone
      receiverAddress
      description
      weight
      createdAt
    }
    pageInfo {
      totalItems
    }
  }
}
    `;

/**
 * __useMyParcelsQuery__
 *
 * To run a query within a React component, call `useMyParcelsQuery` and pass it any options that fit your needs.
 * When your component renders, `useMyParcelsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMyParcelsQuery({
 *   variables: {
 *      page: // value for 'page'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useMyParcelsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<MyParcelsQuery, MyParcelsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<MyParcelsQuery, MyParcelsQueryVariables>(MyParcelsDocument, options);
      }
export function useMyParcelsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<MyParcelsQuery, MyParcelsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<MyParcelsQuery, MyParcelsQueryVariables>(MyParcelsDocument, options);
        }
// @ts-ignore
export function useMyParcelsSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<MyParcelsQuery, MyParcelsQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<MyParcelsQuery, MyParcelsQueryVariables>;
export function useMyParcelsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<MyParcelsQuery, MyParcelsQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<MyParcelsQuery | undefined, MyParcelsQueryVariables>;
export function useMyParcelsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<MyParcelsQuery, MyParcelsQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<MyParcelsQuery, MyParcelsQueryVariables>(MyParcelsDocument, options);
        }
export type MyParcelsQueryHookResult = ReturnType<typeof useMyParcelsQuery>;
export type MyParcelsLazyQueryHookResult = ReturnType<typeof useMyParcelsLazyQuery>;
export type MyParcelsSuspenseQueryHookResult = ReturnType<typeof useMyParcelsSuspenseQuery>;
export type MyParcelsQueryResult = ApolloReactCommon.QueryResult<MyParcelsQuery, MyParcelsQueryVariables>;
export const SearchRestaurantsDocument = gql`
    query SearchRestaurants($page: Int = 1, $limit: Int = 12, $input: SearchRestaurantsInput) {
  searchRestaurants(page: $page, limit: $limit, input: $input) {
    items {
      id
      name
      description
      address
      city
      zipCode
      phone
      cuisineType
      imageUrl
      coverImageUrl
      rating
      deliveryFee
      estimatedDeliveryTime
      latitude
      longitude
      type
      isFeatured
      sortOrder
      isActive
      createdAt
      updatedAt
    }
    pageInfo {
      totalItems
      totalPages
      currentPage
      hasNextPage
      hasPreviousPage
    }
  }
}
    `;

/**
 * __useSearchRestaurantsQuery__
 *
 * To run a query within a React component, call `useSearchRestaurantsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSearchRestaurantsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSearchRestaurantsQuery({
 *   variables: {
 *      page: // value for 'page'
 *      limit: // value for 'limit'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSearchRestaurantsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<SearchRestaurantsQuery, SearchRestaurantsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<SearchRestaurantsQuery, SearchRestaurantsQueryVariables>(SearchRestaurantsDocument, options);
      }
export function useSearchRestaurantsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<SearchRestaurantsQuery, SearchRestaurantsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<SearchRestaurantsQuery, SearchRestaurantsQueryVariables>(SearchRestaurantsDocument, options);
        }
// @ts-ignore
export function useSearchRestaurantsSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<SearchRestaurantsQuery, SearchRestaurantsQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<SearchRestaurantsQuery, SearchRestaurantsQueryVariables>;
export function useSearchRestaurantsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<SearchRestaurantsQuery, SearchRestaurantsQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<SearchRestaurantsQuery | undefined, SearchRestaurantsQueryVariables>;
export function useSearchRestaurantsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<SearchRestaurantsQuery, SearchRestaurantsQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<SearchRestaurantsQuery, SearchRestaurantsQueryVariables>(SearchRestaurantsDocument, options);
        }
export type SearchRestaurantsQueryHookResult = ReturnType<typeof useSearchRestaurantsQuery>;
export type SearchRestaurantsLazyQueryHookResult = ReturnType<typeof useSearchRestaurantsLazyQuery>;
export type SearchRestaurantsSuspenseQueryHookResult = ReturnType<typeof useSearchRestaurantsSuspenseQuery>;
export type SearchRestaurantsQueryResult = ApolloReactCommon.QueryResult<SearchRestaurantsQuery, SearchRestaurantsQueryVariables>;
export const RestaurantDocument = gql`
    query Restaurant($id: ID!) {
  restaurant(id: $id) {
    id
    name
    description
    address
    city
    zipCode
    phone
    cuisineType
    imageUrl
    coverImageUrl
    rating
    deliveryFee
    estimatedDeliveryTime
    latitude
    longitude
    type
    isFeatured
    sortOrder
    isActive
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useRestaurantQuery__
 *
 * To run a query within a React component, call `useRestaurantQuery` and pass it any options that fit your needs.
 * When your component renders, `useRestaurantQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRestaurantQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useRestaurantQuery(baseOptions: ApolloReactHooks.QueryHookOptions<RestaurantQuery, RestaurantQueryVariables> & ({ variables: RestaurantQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<RestaurantQuery, RestaurantQueryVariables>(RestaurantDocument, options);
      }
export function useRestaurantLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<RestaurantQuery, RestaurantQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<RestaurantQuery, RestaurantQueryVariables>(RestaurantDocument, options);
        }
// @ts-ignore
export function useRestaurantSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<RestaurantQuery, RestaurantQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<RestaurantQuery, RestaurantQueryVariables>;
export function useRestaurantSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<RestaurantQuery, RestaurantQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<RestaurantQuery | undefined, RestaurantQueryVariables>;
export function useRestaurantSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<RestaurantQuery, RestaurantQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<RestaurantQuery, RestaurantQueryVariables>(RestaurantDocument, options);
        }
export type RestaurantQueryHookResult = ReturnType<typeof useRestaurantQuery>;
export type RestaurantLazyQueryHookResult = ReturnType<typeof useRestaurantLazyQuery>;
export type RestaurantSuspenseQueryHookResult = ReturnType<typeof useRestaurantSuspenseQuery>;
export type RestaurantQueryResult = ApolloReactCommon.QueryResult<RestaurantQuery, RestaurantQueryVariables>;
export const SearchMenuItemsDocument = gql`
    query SearchMenuItems($page: Int = 1, $limit: Int = 50, $input: SearchMenuItemsInput) {
  searchMenuItems(page: $page, limit: $limit, input: $input) {
    items {
      id
      name
      description
      price
      category
      imageUrl
      isAvailable
      seller
      badge
      isFeatured
      sortOrder
      kind
      marketCategoryId
      marketCategory {
        id
        label
        subtitle
        imageUrl
        icon
        iconLib
        tint
        iconColor
      }
      restaurantId
      supplements {
        id
        name
        price
        isAvailable
        sortOrder
      }
      createdAt
      updatedAt
    }
    pageInfo {
      totalItems
      totalPages
    }
  }
}
    `;

/**
 * __useSearchMenuItemsQuery__
 *
 * To run a query within a React component, call `useSearchMenuItemsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSearchMenuItemsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSearchMenuItemsQuery({
 *   variables: {
 *      page: // value for 'page'
 *      limit: // value for 'limit'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSearchMenuItemsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<SearchMenuItemsQuery, SearchMenuItemsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<SearchMenuItemsQuery, SearchMenuItemsQueryVariables>(SearchMenuItemsDocument, options);
      }
export function useSearchMenuItemsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<SearchMenuItemsQuery, SearchMenuItemsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<SearchMenuItemsQuery, SearchMenuItemsQueryVariables>(SearchMenuItemsDocument, options);
        }
// @ts-ignore
export function useSearchMenuItemsSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<SearchMenuItemsQuery, SearchMenuItemsQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<SearchMenuItemsQuery, SearchMenuItemsQueryVariables>;
export function useSearchMenuItemsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<SearchMenuItemsQuery, SearchMenuItemsQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<SearchMenuItemsQuery | undefined, SearchMenuItemsQueryVariables>;
export function useSearchMenuItemsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<SearchMenuItemsQuery, SearchMenuItemsQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<SearchMenuItemsQuery, SearchMenuItemsQueryVariables>(SearchMenuItemsDocument, options);
        }
export type SearchMenuItemsQueryHookResult = ReturnType<typeof useSearchMenuItemsQuery>;
export type SearchMenuItemsLazyQueryHookResult = ReturnType<typeof useSearchMenuItemsLazyQuery>;
export type SearchMenuItemsSuspenseQueryHookResult = ReturnType<typeof useSearchMenuItemsSuspenseQuery>;
export type SearchMenuItemsQueryResult = ApolloReactCommon.QueryResult<SearchMenuItemsQuery, SearchMenuItemsQueryVariables>;
export const MenuItemsByRestaurantDocument = gql`
    query MenuItemsByRestaurant($restaurantId: ID!, $page: Int = 1, $limit: Int = 50) {
  menuItemsByRestaurant(restaurantId: $restaurantId, page: $page, limit: $limit) {
    items {
      id
      name
      description
      price
      category
      imageUrl
      isAvailable
      seller
      badge
      isFeatured
      sortOrder
      kind
      marketCategoryId
      marketCategory {
        id
        label
        subtitle
        imageUrl
        icon
        iconLib
        tint
        iconColor
      }
      restaurantId
      supplements {
        id
        name
        price
        isAvailable
        sortOrder
      }
      createdAt
      updatedAt
    }
    pageInfo {
      totalItems
      totalPages
    }
  }
}
    `;

/**
 * __useMenuItemsByRestaurantQuery__
 *
 * To run a query within a React component, call `useMenuItemsByRestaurantQuery` and pass it any options that fit your needs.
 * When your component renders, `useMenuItemsByRestaurantQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMenuItemsByRestaurantQuery({
 *   variables: {
 *      restaurantId: // value for 'restaurantId'
 *      page: // value for 'page'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useMenuItemsByRestaurantQuery(baseOptions: ApolloReactHooks.QueryHookOptions<MenuItemsByRestaurantQuery, MenuItemsByRestaurantQueryVariables> & ({ variables: MenuItemsByRestaurantQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<MenuItemsByRestaurantQuery, MenuItemsByRestaurantQueryVariables>(MenuItemsByRestaurantDocument, options);
      }
export function useMenuItemsByRestaurantLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<MenuItemsByRestaurantQuery, MenuItemsByRestaurantQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<MenuItemsByRestaurantQuery, MenuItemsByRestaurantQueryVariables>(MenuItemsByRestaurantDocument, options);
        }
// @ts-ignore
export function useMenuItemsByRestaurantSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<MenuItemsByRestaurantQuery, MenuItemsByRestaurantQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<MenuItemsByRestaurantQuery, MenuItemsByRestaurantQueryVariables>;
export function useMenuItemsByRestaurantSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<MenuItemsByRestaurantQuery, MenuItemsByRestaurantQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<MenuItemsByRestaurantQuery | undefined, MenuItemsByRestaurantQueryVariables>;
export function useMenuItemsByRestaurantSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<MenuItemsByRestaurantQuery, MenuItemsByRestaurantQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<MenuItemsByRestaurantQuery, MenuItemsByRestaurantQueryVariables>(MenuItemsByRestaurantDocument, options);
        }
export type MenuItemsByRestaurantQueryHookResult = ReturnType<typeof useMenuItemsByRestaurantQuery>;
export type MenuItemsByRestaurantLazyQueryHookResult = ReturnType<typeof useMenuItemsByRestaurantLazyQuery>;
export type MenuItemsByRestaurantSuspenseQueryHookResult = ReturnType<typeof useMenuItemsByRestaurantSuspenseQuery>;
export type MenuItemsByRestaurantQueryResult = ApolloReactCommon.QueryResult<MenuItemsByRestaurantQuery, MenuItemsByRestaurantQueryVariables>;
export const TrackingByDeliveryDocument = gql`
    query TrackingByDelivery($deliveryId: ID!) {
  trackingByDelivery(deliveryId: $deliveryId) {
    id
    status
    message
    latitude
    longitude
    createdAt
  }
}
    `;

/**
 * __useTrackingByDeliveryQuery__
 *
 * To run a query within a React component, call `useTrackingByDeliveryQuery` and pass it any options that fit your needs.
 * When your component renders, `useTrackingByDeliveryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTrackingByDeliveryQuery({
 *   variables: {
 *      deliveryId: // value for 'deliveryId'
 *   },
 * });
 */
export function useTrackingByDeliveryQuery(baseOptions: ApolloReactHooks.QueryHookOptions<TrackingByDeliveryQuery, TrackingByDeliveryQueryVariables> & ({ variables: TrackingByDeliveryQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<TrackingByDeliveryQuery, TrackingByDeliveryQueryVariables>(TrackingByDeliveryDocument, options);
      }
export function useTrackingByDeliveryLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<TrackingByDeliveryQuery, TrackingByDeliveryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<TrackingByDeliveryQuery, TrackingByDeliveryQueryVariables>(TrackingByDeliveryDocument, options);
        }
// @ts-ignore
export function useTrackingByDeliverySuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<TrackingByDeliveryQuery, TrackingByDeliveryQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<TrackingByDeliveryQuery, TrackingByDeliveryQueryVariables>;
export function useTrackingByDeliverySuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<TrackingByDeliveryQuery, TrackingByDeliveryQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<TrackingByDeliveryQuery | undefined, TrackingByDeliveryQueryVariables>;
export function useTrackingByDeliverySuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<TrackingByDeliveryQuery, TrackingByDeliveryQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<TrackingByDeliveryQuery, TrackingByDeliveryQueryVariables>(TrackingByDeliveryDocument, options);
        }
export type TrackingByDeliveryQueryHookResult = ReturnType<typeof useTrackingByDeliveryQuery>;
export type TrackingByDeliveryLazyQueryHookResult = ReturnType<typeof useTrackingByDeliveryLazyQuery>;
export type TrackingByDeliverySuspenseQueryHookResult = ReturnType<typeof useTrackingByDeliverySuspenseQuery>;
export type TrackingByDeliveryQueryResult = ApolloReactCommon.QueryResult<TrackingByDeliveryQuery, TrackingByDeliveryQueryVariables>;
export const RegisterPushTokenDocument = gql`
    mutation RegisterPushToken($token: String!) {
  registerPushToken(token: $token) {
    id
  }
}
    `;
export type RegisterPushTokenMutationFn = ApolloReactCommon.MutationFunction<RegisterPushTokenMutation, RegisterPushTokenMutationVariables>;

/**
 * __useRegisterPushTokenMutation__
 *
 * To run a mutation, you first call `useRegisterPushTokenMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRegisterPushTokenMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [registerPushTokenMutation, { data, loading, error }] = useRegisterPushTokenMutation({
 *   variables: {
 *      token: // value for 'token'
 *   },
 * });
 */
export function useRegisterPushTokenMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<RegisterPushTokenMutation, RegisterPushTokenMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<RegisterPushTokenMutation, RegisterPushTokenMutationVariables>(RegisterPushTokenDocument, options);
      }
export type RegisterPushTokenMutationHookResult = ReturnType<typeof useRegisterPushTokenMutation>;
export type RegisterPushTokenMutationResult = ApolloReactCommon.MutationResult<RegisterPushTokenMutation>;
export type RegisterPushTokenMutationOptions = ApolloReactCommon.BaseMutationOptions<RegisterPushTokenMutation, RegisterPushTokenMutationVariables>;