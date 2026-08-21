import React, { useMemo, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { getMockRestaurantCoordinates } from '../mocks/service';
import { mockRestaurants } from '../mocks/data';
import { assetUrl } from '../lib/api';
import { colors, fonts, radius, shadows, spacing } from '../theme';
import FloatingBackButton from '../components/FloatingBackButton';

type Props = NativeStackScreenProps<RootStackParamList, 'NearbyMap'>;

export default function NearbyMapScreen({ navigation }: Props) {
  const restaurants = useMemo(() => mockRestaurants.slice(0, 3), []);
  const mapRef = useRef<MapView>(null);
  const [selectedId, setSelectedId] = useState(restaurants[0]?.id);
  const insets = useSafeAreaInsets();

  const focusRestaurant = (id: string) => {
    setSelectedId(id);
    const coords = getMockRestaurantCoordinates(id);
    if (!coords) return;
    mapRef.current?.animateToRegion(
      {
        ...coords,
        latitudeDelta: 0.022,
        longitudeDelta: 0.022,
      },
      450,
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: -4.2634,
          longitude: 15.2520,
          latitudeDelta: 0.045,
          longitudeDelta: 0.045,
        }}
      >
        {restaurants.map((restaurant) => {
          const coords = getMockRestaurantCoordinates(restaurant.id);
          if (!coords) return null;
          return (
            <Marker
              key={restaurant.id}
              coordinate={coords}
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

      <FloatingBackButton
        navigation={navigation}
        background="rgba(255,255,255,0.94)"
        topOffset={16}
      />

      <View style={styles.bottomSheet}>
        {restaurants.map((restaurant) => (
          <Pressable
            key={restaurant.id}
            style={[styles.item, selectedId === restaurant.id && styles.itemActive]}
            onPress={() => focusRestaurant(restaurant.id)}
          >
            <Image source={{ uri: assetUrl(restaurant.imageUrl ?? restaurant.coverImageUrl) || undefined }} style={styles.image} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{restaurant.name}</Text>
              <Text style={styles.meta}>{restaurant.cuisineType} · {restaurant.city}</Text>
            </View>
            <View style={styles.pinPreview}>
              <View style={styles.pinPreviewDot} />
              <Text style={styles.pinPreviewText}>Biso</Text>
            </View>
          </Pressable>
        ))}
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
    bottom: 16,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadows.lg,
  },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  itemActive: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.xs,
  },
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
});
