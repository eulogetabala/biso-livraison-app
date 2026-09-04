import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useSearchRestaurantsQuery } from '../graphql/operations';
import { useUserLocation } from '../lib/user-location';
import { restaurantDistanceKm } from '../lib/geo-data';
import { useFavorites } from '../lib/favorites';
import { colors, fonts, radius, shadows, spacing } from '../theme';
import { EmptyState, formatPrice, SkeletonBlock } from '../components/ui';
import OpenClosedBadge from '../components/OpenClosedBadge';
import FloatingBackButton from '../components/FloatingBackButton';
import { AppTextInput } from '../components/AppTextInput';
import RestaurantCoverImage from '../components/RestaurantCoverImage';
import { formatCuisineDisplay } from '../lib/cuisine-display';

type Props = NativeStackScreenProps<RootStackParamList, 'Restaurants'>;

export default function RestaurantsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { coords: userCoords } = useUserLocation();
  const { isFavoriteRestaurant, toggleFavoriteRestaurant } = useFavorites();
  const [query, setQuery] = useState('');

  const { data, loading } = useSearchRestaurantsQuery({
    variables: {
      page: 1,
      limit: 50,
      input: { query: query || undefined, onlyActive: false, excludeMarket: true },
    },
  });

  const restaurants = data?.searchRestaurants.items ?? [];

  const decorated = useMemo(
    () =>
      restaurants.map((restaurant) => ({
        ...restaurant,
        distanceKm: restaurantDistanceKm(userCoords, restaurant),
      })),
    [restaurants, userCoords],
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.secondary, colors.secondaryDark]} style={[styles.hero, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.heroTitle}>Tous les restaurants</Text>
      </LinearGradient>
      <FloatingBackButton navigation={navigation} />

      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={17} color={colors.textMuted} />
          <AppTextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Rechercher un restaurant…"
          />
          {query.length > 0 ? (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={17} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <FlatList
        data={decorated}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? (
            <View style={styles.skeletons}>
              <SkeletonBlock width="100%" height={200} style={styles.skeletonCard} />
              <SkeletonBlock width="100%" height={200} style={styles.skeletonCard} />
            </View>
          ) : (
            <EmptyState title="Aucun restaurant trouvé" subtitle="Essayez un autre nom ou une autre spécialité." icon="🍽️" />
          )
        }
        renderItem={({ item }) => {
          const isFav = isFavoriteRestaurant(item.id);
          return (
            <Pressable style={styles.card} onPress={() => navigation.navigate('Restaurant', { id: item.id, name: item.name })}>
              <RestaurantCoverImage
                coverImageUrl={item.coverImageUrl}
                logoImageUrl={item.imageUrl}
                height={220}
                logoSize={56}
                nameFallback={item.name}
              />
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.74)']} style={styles.overlay} />
              <Pressable style={styles.favBtn} hitSlop={8} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleFavoriteRestaurant(item); }}>
                <View style={[styles.favBtnInner, isFav && styles.favBtnActive]}>
                  <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={17} color="#fff" />
                </View>
              </Pressable>
              <View style={styles.rating}>
                <Ionicons name="star" size={12} color="#fff" />
                <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
              </View>
              <View style={styles.statusBadge}>
                <OpenClosedBadge isOpen={item.isActive} compact />
              </View>
              <View style={styles.body}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>{formatCuisineDisplay(item.cuisineType)} · {item.city}</Text>
                <View style={styles.metricsRow}>
                  {item.distanceKm != null ? (
                    <View style={styles.metricPill}><Ionicons name="navigate-outline" size={12} color="#fff" /><Text style={styles.metricText}>{item.distanceKm.toFixed(1)} km</Text></View>
                  ) : null}
                  <View style={styles.metricPill}><Ionicons name="time-outline" size={12} color="#fff" /><Text style={styles.metricText}>{item.estimatedDeliveryTime} min</Text></View>
                  <View style={styles.metricPill}><Ionicons name="pricetag-outline" size={12} color="#fff" /><Text style={styles.metricText}>{formatPrice(item.deliveryFee)}</Text></View>
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hero: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, borderBottomLeftRadius: radius.xl, borderBottomRightRadius: radius.xl },
  heroTitle: { color: '#fff', fontFamily: fonts.titleBold, fontSize: 20, textAlign: 'center' },
  searchWrap: { paddingHorizontal: spacing.lg, marginTop: spacing.md },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.surface, borderRadius: radius.full, paddingHorizontal: spacing.md, height: 44, ...shadows.sm },
  searchInput: { flex: 1, fontSize: 14, color: colors.text, fontFamily: fonts.bodyMedium },
  list: { padding: spacing.lg, gap: spacing.md, paddingBottom: 120 },
  skeletons: { gap: spacing.md },
  skeletonCard: { borderRadius: radius.xl },
  card: { height: 220, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: colors.surface, ...shadows.lg },
  image: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFill },
  rating: { position: 'absolute', top: spacing.md, right: spacing.md, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(14,23,38,0.45)', paddingHorizontal: 10, paddingVertical: 7, borderRadius: radius.full },
  ratingText: { color: '#fff', fontFamily: fonts.bodyBold, fontSize: 12 },
  statusBadge: { position: 'absolute', top: spacing.md, left: 56, zIndex: 2 },
  favBtn: { position: 'absolute', top: spacing.md, left: spacing.md, zIndex: 2 },
  favBtnInner: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  favBtnActive: { backgroundColor: colors.primary },
  body: { position: 'absolute', left: spacing.lg, right: spacing.lg, bottom: spacing.lg },
  name: { color: '#fff', fontFamily: fonts.titleBold, fontSize: 17 },
  meta: { color: 'rgba(255,255,255,0.76)', fontFamily: fonts.bodyBold, fontSize: 12, marginTop: 4 },
  metricsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.sm },
  metricPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.16)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.full },
  metricText: { color: '#fff', fontFamily: fonts.bodyBold, fontSize: 11 },
});
