import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import type { RestaurantModel } from '../graphql/types';
import {
  useMyFavoritesQuery,
  useRemoveFavoriteMutation,
  useToggleFavoriteMutation,
} from '../graphql/operations';
import { useAuth } from './auth';

export type FavoriteItem = {
  id: string;
  name: string;
  kind: 'product' | 'restaurant';
  price?: number;
  imageUrl?: string | null;
  seller?: string;
  cuisineType?: string;
  rating?: number;
  city?: string;
};

type FavoritesContextValue = {
  favorites: FavoriteItem[];
  loading: boolean;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (item: FavoriteItem) => void;
  removeFavorite: (id: string, kind: FavoriteItem['kind']) => void;
  isFavoriteRestaurant: (id: string) => boolean;
  toggleFavoriteRestaurant: (restaurant: RestaurantModel) => void;
  count: number;
};

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

function fromApiFavorite(f: {
  targetId: string;
  kind: 'RESTAURANT' | 'PRODUCT';
  name: string;
  imageUrl?: string | null;
  price?: number | null;
  seller?: string | null;
  cuisineType?: string | null;
  rating?: number | null;
  city?: string | null;
}): FavoriteItem {
  return {
    id: f.targetId,
    name: f.name,
    kind: f.kind === 'RESTAURANT' ? 'restaurant' : 'product',
    price: f.price ?? undefined,
    imageUrl: f.imageUrl,
    seller: f.seller ?? undefined,
    cuisineType: f.cuisineType ?? undefined,
    rating: f.rating ?? undefined,
    city: f.city ?? undefined,
  };
}

function toToggleInput(item: FavoriteItem) {
  return {
    targetId: item.id,
    kind: item.kind === 'restaurant' ? ('RESTAURANT' as const) : ('PRODUCT' as const),
    name: item.name,
    imageUrl: item.imageUrl ?? undefined,
    price: item.price,
    seller: item.seller,
    cuisineType: item.cuisineType,
    rating: item.rating,
    city: item.city,
  };
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { data, loading, refetch } = useMyFavoritesQuery({ skip: !user });
  const [toggleFavoriteMutation] = useToggleFavoriteMutation();
  const [removeFavoriteMutation] = useRemoveFavoriteMutation();

  useEffect(() => {
    if (user) void refetch();
  }, [user, refetch]);

  const favorites = useMemo(
    () => (data?.myFavorites ?? []).map(fromApiFavorite),
    [data],
  );

  const isFavorite = useCallback(
    (id: string) => favorites.some((f) => f.id === id),
    [favorites],
  );

  const toggleFavorite = useCallback(
    (item: FavoriteItem) => {
      if (!user) return;
      void toggleFavoriteMutation({
        variables: { input: toToggleInput(item) },
        onCompleted: () => void refetch(),
      });
    },
    [user, toggleFavoriteMutation, refetch],
  );

  const removeFavorite = useCallback(
    (id: string, kind: FavoriteItem['kind']) => {
      if (!user) return;
      void removeFavoriteMutation({
        variables: {
          targetId: id,
          kind: kind === 'restaurant' ? 'RESTAURANT' : 'PRODUCT',
        },
        update: () => void refetch(),
      });
    },
    [user, removeFavoriteMutation, refetch],
  );

  const isFavoriteRestaurant = useCallback(
    (id: string) => favorites.some((f) => f.kind === 'restaurant' && f.id === id),
    [favorites],
  );

  const toggleFavoriteRestaurant = useCallback(
    (restaurant: RestaurantModel) => {
      toggleFavorite({
        id: restaurant.id,
        name: restaurant.name,
        kind: 'restaurant',
        imageUrl: restaurant.coverImageUrl ?? restaurant.imageUrl,
        cuisineType: restaurant.cuisineType,
        rating: restaurant.rating,
        city: restaurant.city,
      });
    },
    [toggleFavorite],
  );

  const value = useMemo(
    () => ({
      favorites,
      loading,
      isFavorite,
      toggleFavorite,
      removeFavorite,
      isFavoriteRestaurant,
      toggleFavoriteRestaurant,
      count: favorites.length,
    }),
    [
      favorites,
      loading,
      isFavorite,
      toggleFavorite,
      removeFavorite,
      isFavoriteRestaurant,
      toggleFavoriteRestaurant,
    ],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
