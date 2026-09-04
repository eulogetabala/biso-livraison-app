import React, { useMemo, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useSearchRestaurantsQuery } from '../graphql/operations';
import { distanceKmBetween, restaurantCoords, restaurantDistanceKm } from '../lib/geo-data';
import { useUserLocation } from '../lib/user-location';
import { assetUrl } from '../lib/api';
import { colors, fonts, radius, shadows, spacing } from '../theme';
import FloatingBackButton from '../components/FloatingBackButton';
import { TAB_BAR_OFFSET } from '../components/AppTabBar';
import { SkeletonBlock } from '../components/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'NearbyMap'>;

export default function NearbyMapScreen({ navigation }: Props) {
  const { data, loading } = useSearchRestaurantsQuery({
    variables: { page: 1, limit: 20, input: { onlyActive: true, excludeMarket: true } },
  });

  const restaurants = useMemo(() => data?.searchRestaurants.items ?? [], [data]);

  const mapRef = useRef<MapView>(null);
  const insets = useSafeAreaInsets();
  const { coords: userCoords } = useUserLocation();
  const [selectedId, setSelectedId] = useState<string | undefined>();

  const nearbyRestaurants = useMemo(() => {
    const withDistance = restaurants.map((restaurant) => ({
      ...restaurant,
      coords: restaurantCoords(restaurant),
      distanceKm: restaurantDistanceKm(userCoords, restaurant),
    }));
    return withDistance
      .filter((r) => r.coords)
      .sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999))
      .slice(0, 6);
  }, [restaurants, userCoords]);

  React.useEffect(() => {
    if (!selectedId && nearbyRestaurants[0]?.id) {
      setSelectedId(nearbyRestaurants[0].id);
    }
  }, [nearbyRestaurants, selectedId]);

  const focusRestaurant = (id: string) => {
    setSelectedId(id);
    const restaurant = nearbyRestaurants.find((r) => r.id === id);
    const coords = restaurant ? restaurantCoords(restaurant) : null;
    if (!coords) return;
    mapRef.current?.animateToRegion({ ...coords, latitudeDelta: 0.022, longitudeDelta: 0.022 }, 450);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: userCoords?.latitude ?? -4.2634,
          longitude: userCoords?.longitude ?? 15.252,
          latitudeDelta: 0.045,
          longitudeDelta: 0.045,
        }}
      >
        {userCoords ? (
          <Marker coordinate={userCoords} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.userMarker}>
              <View style={styles.userMarkerDot} />
            </View>
          </Marker>
        ) : null}

        {nearbyRestaurants.map((restaurant) => {
          if (!restaurant.coords) return null;
          return (
            <Marker
              key={restaurant.id}
              coordinate={restaurant.coords}
              title={restaurant.name}
              description={`${restaurant.cuisineType} · ${restaurant.city}`}
              onPress={() => focusRestaurant(restaurant.id)}
            >
              <View style={styles.markerWrap}>
                <View style={[styles.markerPill, selectedId === restaurant.id && styles.markerPillActive]}>
                  <Text style={styles.markerText}>Biso</Text>
                </View>
                <View style={[styles.markerStem, selectedId === restaurant.id && styles.markerStemActive]} />
              </View>
            </Marker>
          );
        })}
      </MapView>

      <View style={[styles.overlay, { top: insets.top + 16, left: 64 }]}>
        <Text style={styles.title}>Restaurants proches</Text>
      </View>

      <FloatingBackButton navigation={navigation} background="rgba(255,255,255,0.94)" topOffset={16} />

      <View style={styles.bottomSheet}>
        {loading && nearbyRestaurants.length === 0 ? (
          <SkeletonBlock width="100%" height={64} />
        ) : (
          nearbyRestaurants.map((restaurant) => (
            <Pressable
              key={restaurant.id}
              style={[styles.item, selectedId === restaurant.id && styles.itemActive]}
              onPress={() => focusRestaurant(restaurant.id)}
            >
              <Image
                source={{ uri: assetUrl(restaurant.imageUrl ?? restaurant.coverImageUrl) || undefined }}
                style={styles.image}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{restaurant.name}</Text>
                <Text style={styles.meta}>{restaurant.cuisineType} · {restaurant.city}</Text>
                {restaurant.distanceKm != null ? (
                  <Text style={styles.distance}>À {restaurant.distanceKm.toFixed(1)} km de vous</Text>
                ) : null}
              </View>
              <View style={styles.pinPreview}>
                <View style={styles.pinPreviewDot} />
                <Text style={styles.pinPreviewText}>Biso</Text>
              </View>
            </Pressable>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.md,
  },
  title: { color: colors.secondary, fontFamily: fonts.titleBold, fontSize: 18, textAlign: 'center' },
  bottomSheet: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: TAB_BAR_OFFSET + 8,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadows.lg,
  },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  itemActive: { backgroundColor: colors.background, borderRadius: radius.md, padding: spacing.xs },
  image: { width: 52, height: 52, borderRadius: radius.sm, backgroundColor: colors.border },
  name: { color: colors.secondary, fontFamily: fonts.titleSemiBold, fontSize: 14 },
  meta: { color: colors.textMuted, fontFamily: fonts.bodyMedium, fontSize: 12, marginTop: 3 },
  pinPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  pinPreviewDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  pinPreviewText: { color: colors.primary, fontFamily: fonts.bodyBold, fontSize: 11 },
  markerWrap: { alignItems: 'center' },
  markerPill: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: '#fff',
    ...shadows.md,
  },
  markerPillActive: { backgroundColor: colors.primary },
  markerText: { color: '#fff', fontFamily: fonts.bodyBold, fontSize: 11 },
  markerStem: {
    width: 10,
    height: 10,
    marginTop: -2,
    borderRadius: 5,
    backgroundColor: colors.secondary,
    borderWidth: 2,
    borderColor: '#fff',
  },
  markerStemActive: { backgroundColor: colors.primary },
  userMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary + '33',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  userMarkerDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  distance: { color: colors.primary, fontFamily: fonts.bodyBold, fontSize: 11, marginTop: 3 },
});
