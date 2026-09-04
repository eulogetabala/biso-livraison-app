import React, { useMemo, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useFavorites, type FavoriteItem } from '../lib/favorites';
import { useCart } from '../lib/cart';
import { useMarketRestaurant } from '../lib/use-market';
import { colors, fonts, radius, shadows, spacing } from '../theme';
import { EmptyState, formatPrice } from '../components/ui';
import ProductDetailModal from '../components/ProductDetailModal';
import { assetUrl } from '../lib/api';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Favorites'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function FavoritesScreen({ navigation }: Props) {
  const { favorites, removeFavorite } = useFavorites();
  const { addItem } = useCart();
  const { marketId, deliveryFee } = useMarketRestaurant();
  const [selected, setSelected] = useState<FavoriteItem | null>(null);

  const restaurantFavorites = useMemo(
    () => favorites.filter((f) => f.kind === 'restaurant'),
    [favorites],
  );
  const productFavorites = useMemo(
    () => favorites.filter((f) => f.kind === 'product'),
    [favorites],
  );

  const handleAddToCart = (quantity: number) => {
    if (!selected || !marketId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addItem(
      {
        __typename: 'MenuItemModel',
        id: selected.id,
        name: selected.name,
        description: null,
        price: selected.price ?? 0,
        category: 'MAIN_COURSE',
        imageUrl: selected.imageUrl ?? null,
        isAvailable: true,
        kind: 'SIMPLE_PRODUCT',
        restaurantId: null,
        restaurant: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      marketId,
      'Produits particuliers',
      deliveryFee,
      undefined,
      quantity,
    );
    setSelected(null);
  };

  // Regroupe les produits par rangées de 2 pour la grille.
  const productRows = useMemo(() => {
    const rows: FavoriteItem[][] = [];
    for (let i = 0; i < productFavorites.length; i += 2) {
      rows.push(productFavorites.slice(i, i + 2));
    }
    return rows;
  }, [productFavorites]);

  if (favorites.length === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={[colors.secondary, colors.secondaryDark]} style={styles.hero}>
          <Text style={styles.heroTitle}>Mes favoris</Text>
        </LinearGradient>
        <View style={styles.emptyWrap}>
          <EmptyState
            title="Aucun favori"
            subtitle="Touche le cœur sur un produit ou un restaurant pour le retrouver ici."
            icon="❤️"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.secondary, colors.secondaryDark]} style={styles.hero}>
        <Text style={styles.heroTitle}>Mes favoris</Text>
      </LinearGradient>

      <FlatList
        data={[0]}
        keyExtractor={() => 'root'}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={() => (
          <>
            {restaurantFavorites.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Restaurants favoris</Text>
                {restaurantFavorites.map((item) => (
                  <Pressable
                    key={item.id}
                    style={styles.restoCard}
                    onPress={() => navigation.navigate('Restaurant', { id: item.id, name: item.name })}
                  >
                    <Image source={{ uri: assetUrl(item.imageUrl ?? '') || undefined }} style={styles.restoImage} />
                    <View style={styles.restoBody}>
                      <Text style={styles.restoName} numberOfLines={1}>{item.name}</Text>
                      {item.cuisineType ? (
                        <Text style={styles.restoMeta} numberOfLines={1}>
                          {item.cuisineType}
                          {item.city ? ` · ${item.city}` : ''}
                        </Text>
                      ) : null}
                      {item.rating != null ? (
                        <View style={styles.ratingRow}>
                          <Ionicons name="star" size={12} color={colors.warning} />
                          <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                        </View>
                      ) : null}
                    </View>
                    <Pressable
                      style={styles.restoHeart}
                      hitSlop={8}
                      onPress={() => {
                        Haptics.selectionAsync();
                        removeFavorite(item.id, item.kind);
                      }}
                    >
                      <Ionicons name="heart" size={17} color={colors.primary} />
                    </Pressable>
                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                  </Pressable>
                ))}
              </View>
            ) : null}

            {productFavorites.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Produits favoris</Text>
                {productRows.map((row, index) => (
                  <View key={index} style={styles.row}>
                    {row.map((item) => (
                      <FavoriteProductCard
                        key={item.id}
                        item={item}
                        onRemove={removeFavorite}
                        onPress={() => setSelected(item)}
                      />
                    ))}
                  </View>
                ))}              </View>
            ) : null}
          </>
        )}
      />

      <ProductDetailModal
        visible={selected != null}
        onClose={() => setSelected(null)}
        id={selected?.id ?? ''}
        imageUrl={selected?.imageUrl}
        name={selected?.name ?? ''}
        price={selected?.price ?? 0}
        seller={selected?.seller}
        onAddToCart={handleAddToCart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hero: {
    paddingTop: 24,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  heroTitle: { color: '#fff', fontFamily: fonts.titleBold, fontSize: 20, textAlign: 'center' },
  emptyWrap: { flex: 1, justifyContent: 'center' },
  list: { padding: spacing.lg, gap: spacing.lg, paddingBottom: 120, flexGrow: 1 },
  section: { gap: spacing.md },
  sectionTitle: {
    color: colors.secondary,
    fontFamily: fonts.titleBold,
    fontSize: 16,
    marginBottom: spacing.xs,
  },
  row: { flexDirection: 'row', gap: spacing.md },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  image: { width: '100%', height: 130, backgroundColor: colors.border },
  heartBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  body: { padding: spacing.md },
  name: { color: colors.secondary, fontFamily: fonts.titleSemiBold, fontSize: 14 },
  seller: { color: colors.textMuted, fontFamily: fonts.bodyMedium, fontSize: 12, marginTop: 3 },
  price: { color: colors.primary, fontFamily: fonts.titleBold, fontSize: 14, marginTop: spacing.xs },
  restoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.sm,
    ...shadows.sm,
  },
  restoImage: { width: 64, height: 64, borderRadius: radius.md, backgroundColor: colors.border },
  restoBody: { flex: 1 },
  restoName: { color: colors.secondary, fontFamily: fonts.titleSemiBold, fontSize: 15 },
  restoMeta: { color: colors.textMuted, fontFamily: fonts.bodyMedium, fontSize: 12, marginTop: 3 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  ratingText: { color: colors.secondary, fontFamily: fonts.bodyBold, fontSize: 12 },
  restoHeart: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

function FavoriteProductCard({
  item,
  onRemove,
  onPress,
}: {
  item: FavoriteItem;
  onRemove: (id: string, kind: FavoriteItem['kind']) => void;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image source={{ uri: item.imageUrl ?? undefined }} style={styles.image} />
      <Pressable
        style={styles.heartBtn}
        hitSlop={8}
        onPress={() => {
          Haptics.selectionAsync();
          onRemove(item.id, item.kind);
        }}
      >
        <Ionicons name="heart" size={16} color={colors.primary} />
      </Pressable>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        {item.seller ? <Text style={styles.seller} numberOfLines={1}>{item.seller}</Text> : null}
        <Text style={styles.price}>{formatPrice(item.price ?? 0)}</Text>
      </View>
    </Pressable>
  );
}
