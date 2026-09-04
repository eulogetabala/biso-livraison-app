import { useMarketRestaurantQuery } from '../graphql/operations';

export function useMarketRestaurant() {
  const { data, loading, refetch } = useMarketRestaurantQuery();
  const market = data?.marketRestaurant;

  return {
    marketId: market?.id,
    marketName: market?.name ?? 'Biso Market',
    deliveryFee: market?.deliveryFee ?? 0,
    isActive: market?.isActive ?? true,
    loading,
    refetch,
  };
}
