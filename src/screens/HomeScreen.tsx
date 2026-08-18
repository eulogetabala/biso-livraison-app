import React, { useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSearchRestaurantsQuery } from '../graphql/operations';
import type { RestaurantModel } from '../graphql/types';
import { assetUrl } from '../lib/api';
import { useCart } from '../lib/cart';
import { colors, radius, spacing } from '../theme';
import { EmptyState, formatPrice, Spinner } from '../components/ui';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

const CUISINES: { label: string; value?: string | 'ALL' }[] = [
  { label: 'Tous', value: 'ALL' },
  { label: 'Africain', value: 'AFRICAIN' },
  { label: 'Fast food', value: 'FAST_FOOD' },
  { label: 'Pizza', value: 'PIZZA' },
  { label: 'Burger', value: 'BURGER' },
  { label: 'Salade', value: 'SALADE' },
  { label: 'Sucré', value: 'DESSERT' },
];

export default function HomeScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const [cuisine, setCuisine] = useState<string | 'ALL'>('ALL');
  const { count, total } = useCart();
  const { data, loading, error, refetch } = useSearchRestaurantsQuery({
    variables: {
      page: 1,
      limit: 20,
      input: {
        query: query || undefined,
        cuisineType: cuisine === 'ALL' ? undefined : cuisine,
      },
    },
  });

  const restaurants = data?.searchRestaurants.items ?? [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>Biso Livraison</Text>
        <Text style={styles.tagline}>Que voulez-vous manger aujourd'hui ?</Text>
      </View>

      <TextInput
        style={styles.search}
        value={query}
        onChangeText={(t) => {
          setQuery(t);
          refetch({ input: { query: t || undefined, cuisineType: cuisine === 'ALL' ? undefined : cuisine } });
        }}
        placeholder="Rechercher un restaurant, une cuisine…"
        placeholderTextColor={colors.textMuted}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {CUISINES.map((c) => {
          const active = cuisine === c.value;
          return (
            <Pressable
              key={c.label}
              onPress={() => {
                const value = c.value ?? 'ALL';
                setCuisine(value);
                refetch({
                  input: {
                    query: query || undefined,
                    cuisineType: value === 'ALL' ? undefined : value,
                  },
                });
              }}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{c.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {loading ? (
        <Spinner />
      ) : error ? (
        <EmptyState title="Impossible de charger les restaurants" subtitle="Vérifiez votre connexion puis réessayez." />
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item.id}
          onRefresh={() => refetch()}
          refreshing={loading}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptyState title="Aucun restaurant trouvé" subtitle="Essayez un autre mot-clé ou filtre." />
          }
          renderItem={({ item }) => (
            <RestaurantCard
              restaurant={item}
              onPress={() => navigation.navigate('Restaurant', { id: item.id, name: item.name })}
            />
          )}
        />
      )}

      {count > 0 && (
        <Pressable style={styles.cartBar} onPress={() => navigation.navigate('Checkout')}>
          <Text style={styles.cartBarText}>
            Panier · {count} article{count > 1 ? 's' : ''}
          </Text>
          <Text style={styles.cartBarPrice}>{formatPrice(total)}</Text>
        </Pressable>
      )}
    </View>
  );
}

function RestaurantCard({ restaurant, onPress }: { restaurant: RestaurantModel; onPress: () => void }) {
  const imageUrl = assetUrl(restaurant.imageUrl ?? restaurant.coverImageUrl);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.cardImage} /> : <View style={[styles.cardImage, styles.cardImagePlaceholder]} />}
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardName} numberOfLines={1}>
            {restaurant.name}
          </Text>
          {restaurant.rating ? <Text style={styles.cardRating}>★ {restaurant.rating.toFixed(1)}</Text> : null}
        </View>
        <Text style={styles.cardMeta} numberOfLines={1}>
          {restaurant.cuisineType} · {restaurant.city}
        </Text>
        <Text style={styles.cardFooter}>
          Livraison {formatPrice(restaurant.deliveryFee)} · {restaurant.estimatedDeliveryTime} min
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  logo: { fontSize: 26, fontWeight: '800', color: colors.primary },
  tagline: { fontSize: 14, color: colors.textMuted, marginTop: 2 },
  search: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 15,
  },
  chips: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textMuted, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  cardPressed: { opacity: 0.85 },
  cardImage: { width: '100%', height: 140, backgroundColor: colors.border },
  cardImagePlaceholder: { backgroundColor: colors.primaryLight },
  cardBody: { padding: spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardName: { fontSize: 17, fontWeight: '700', color: colors.text, flex: 1 },
  cardRating: { fontSize: 14, fontWeight: '600', color: colors.warning },
  cardMeta: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  cardFooter: { fontSize: 13, fontWeight: '600', color: colors.text, marginTop: spacing.sm },
  cartBar: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartBarText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  cartBarPrice: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
