import React, { useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useFavorites, type FavoriteItem } from '../lib/favorites';
import { useCart } from '../lib/cart';
import { MARKET_RESTAURANT_ID, MARKET_RESTAURANT_NAME } from '../lib/cart-helpers';
import { colors, fonts, radius, shadows, spacing } from '../theme';
import { EmptyState, formatPrice } from '../components/ui';
import ProductDetailModal from '../components/ProductDetailModal';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../navigation/types';

type Props = BottomTabScreenProps<MainTabParamList, 'Favorites'>;

export default function FavoritesScreen({ navigation }: Props) {
  const { favorites, removeFavorite } = useFavorites();
  const { addItem } = useCart();
  const [selected, setSelected] = useState<FavoriteItem | null>(null);

  const handleAddToCart = (quantity: number) => {
    if (!selected) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addItem(
      {
        __typename: 'MenuItemModel',
        id: selected.id,
        name: selected.name,
        description: null,
        price: selected.price,
        category: 'MAIN_COURSE',
        imageUrl: selected.imageUrl ?? null,
        isAvailable: true,
        restaurantId: MARKET_RESTAURANT_ID,
        restaurant: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      MARKET_RESTAURANT_ID,
      MARKET_RESTAURANT_NAME,
      0,
      undefined,
      quantity,
    );
    setSelected(null);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.secondary, colors.secondaryDark]} style={styles.hero}>
        <Text style={styles.heroTitle}>Mes favoris</Text>
      </LinearGradient>

      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            title="Aucun favori"
            subtitle="Touche le cœur sur un produit pour le retrouver ici."
            icon="❤️"
          />
        }
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => setSelected(item)}>
            <Image source={{ uri: item.imageUrl ?? undefined }} style={styles.image} />
            <Pressable
              style={styles.heartBtn}
              hitSlop={8}
              onPress={() => {
                Haptics.selectionAsync();
                removeFavorite(item.id);
              }}
            >
              <Ionicons name="heart" size={16} color={colors.primary} />
            </Pressable>
            <View style={styles.body}>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              {item.seller ? <Text style={styles.seller} numberOfLines={1}>{item.seller}</Text> : null}
              <Text style={styles.price}>{formatPrice(item.price)}</Text>
            </View>
          </Pressable>
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
  list: { padding: spacing.lg, gap: spacing.md, flexGrow: 1 },
  row: { gap: spacing.md },
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
});
