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


export type LoginMutation = { login: { accessToken: string, user: { id: string, email: string, firstName: string, lastName: string, phone: string, role: string, avatarUrl: string | null } } };

export type RegisterMutationVariables = Exact<{
  input: Types.CreateUserInput;
}>;


export type RegisterMutation = { createUser: { id: string, email: string, firstName: string, lastName: string, role: string } };

export type UpdateProfileMutationVariables = Exact<{
  input: Types.UpdateProfileInput;
}>;


export type UpdateProfileMutation = { updateProfile: { id: string, firstName: string, lastName: string, phone: string, avatarUrl: string | null } };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { me: { id: string, email: string, firstName: string, lastName: string, phone: string, role: string, avatarUrl: string | null } };

export type CreateOrderMutationVariables = Exact<{
  input: Types.CreateOrderInput;
}>;


export type CreateOrderMutation = { createOrder: { id: string, status: Types.OrderStatus, total: number, deliveryFee: number, grandTotal: number, deliveryAddress: string, deliveryCity: string, deliveryZipCode: string, createdAt: string, payment: { method: Types.PaymentMethod, status: Types.PaymentStatus, amount: number } | null, restaurant: { id: string, name: string, imageUrl: string | null } | null, items: Array<{ quantity: number, unitPrice: number, menuItem: { id: string, name: string, price: number } | null }> } };

export type MyOrdersQueryVariables = Exact<{
  page?: number | null | undefined;
  limit?: number | null | undefined;
}>;


export type MyOrdersQuery = { myOrders: { items: Array<{ id: string, status: Types.OrderStatus, total: number, deliveryFee: number, grandTotal: number, deliveryAddress: string, deliveryCity: string, createdAt: string, restaurant: { id: string, name: string, imageUrl: string | null } | null, payment: { method: Types.PaymentMethod, status: Types.PaymentStatus } | null, delivery: { id: string, status: Types.DeliveryStatus, driver: { id: string, firstName: string, lastName: string, phone: string } | null } | null }>, pageInfo: { totalItems: number, totalPages: number, currentPage: number, hasNextPage: boolean } } };

export type OrderQueryVariables = Exact<{
  id: string | number;
}>;


export type OrderQuery = { order: { id: string, status: Types.OrderStatus, total: number, deliveryFee: number, grandTotal: number, deliveryAddress: string, deliveryCity: string, deliveryZipCode: string, createdAt: string, restaurant: { id: string, name: string, imageUrl: string | null, phone: string } | null, items: Array<{ quantity: number, unitPrice: number, menuItem: { id: string, name: string, price: number } | null }>, payment: { method: Types.PaymentMethod, status: Types.PaymentStatus, amount: number } | null, delivery: { id: string, status: Types.DeliveryStatus, driver: { id: string, firstName: string, lastName: string, phone: string } | null } | null } };

export type CancelOrderMutationVariables = Exact<{
  id: string | number;
}>;


export type CancelOrderMutation = { cancelOrder: { id: string, status: Types.OrderStatus } };

export type SearchRestaurantsQueryVariables = Exact<{
  page?: number | null | undefined;
  limit?: number | null | undefined;
  input?: Types.SearchRestaurantsInput | null | undefined;
}>;


export type SearchRestaurantsQuery = { searchRestaurants: { items: Array<{ id: string, name: string, description: string | null, address: string, city: string, zipCode: string, phone: string, cuisineType: string, imageUrl: string | null, coverImageUrl: string | null, rating: number, deliveryFee: number, estimatedDeliveryTime: number, isActive: boolean }>, pageInfo: { totalItems: number, totalPages: number, currentPage: number, hasNextPage: boolean, hasPreviousPage: boolean } } };

export type RestaurantQueryVariables = Exact<{
  id: string | number;
}>;


export type RestaurantQuery = { restaurant: { id: string, name: string, description: string | null, address: string, city: string, zipCode: string, phone: string, cuisineType: string, imageUrl: string | null, coverImageUrl: string | null, rating: number, deliveryFee: number, estimatedDeliveryTime: number, isActive: boolean } };

export type MenuItemsByRestaurantQueryVariables = Exact<{
  restaurantId: string | number;
  page?: number | null | undefined;
  limit?: number | null | undefined;
}>;


export type MenuItemsByRestaurantQuery = { menuItemsByRestaurant: { items: Array<{ id: string, name: string, description: string | null, price: number, category: Types.MenuItemCategory, imageUrl: string | null, isAvailable: boolean }>, pageInfo: { totalItems: number, totalPages: number } } };


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
export const UpdateProfileDocument = gql`
    mutation UpdateProfile($input: UpdateProfileInput!) {
  updateProfile(input: $input) {
    id
    firstName
    lastName
    phone
    avatarUrl
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
    createdAt
    restaurant {
      id
      name
      imageUrl
      phone
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
      isActive
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
    isActive
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