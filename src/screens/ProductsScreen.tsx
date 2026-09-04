import React, { useMemo, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import type { CatalogProduct } from '../lib/catalog';
import { useSearchMenuItemsQuery } from '../graphql/operations';
import type { MenuItemModel } from '../graphql/types';
import { filterProductsByCategory, menuItemToCatalogProduct } from '../lib/catalog';
import { colors, fonts, radius, shadows, spacing } from '../theme';
import { formatPrice, SkeletonBlock } from '../components/ui';
import ProductDetailModal from '../components/ProductDetailModal';
import { useCart } from '../lib/cart';
import { useMarketRestaurant } from '../lib/use-market';
import FloatingBackButton from '../components/FloatingBackButton';

type Props = NativeStackScreenProps<RootStackParamList, 'Products'>;

export default function ProductsScreen({ route, navigation }: Props) {
  const selectedCategory = route.params?.category;
  const { addItem } = useCart();
  const { marketId, deliveryFee } = useMarketRestaurant();
  const insets = useSafeAreaInsets();
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItemModel | null>(null);

  const { data, loading } = useSearchMenuItemsQuery({
    variables: {
      page: 1,
      limit: 50,
      input: { simpleProductsOnly: true },
    },
  });

  const menuItems = data?.searchMenuItems.items ?? [];
  const products = useMemo(() => menuItems.map(menuItemToCatalogProduct), [menuItems]);

  const filteredProducts = useMemo(
    () => filterProductsByCategory(products, selectedCategory),
    [products, selectedCategory],
  );

  const handleModalAdd = (quantity: number) => {
    if (!selectedMenuItem || !marketId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addItem(selectedMenuItem, marketId, 'Produits particuliers', deliveryFee, undefined, quantity);
    setSelectedProduct(null);
    setSelectedMenuItem(null);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.secondary, colors.secondaryDark]} style={[styles.hero, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.heroTitle}>{selectedCategory ? selectedCategory : 'Tous les produits'}</Text>
      </LinearGradient>

      <FloatingBackButton navigation={navigation} />

      {selectedCategory ? (
        <Pressable style={styles.backChip} onPress={() => navigation.navigate('Categories')}>
          <Ionicons name="grid-outline" size={15} color={colors.primary} />
          <Text style={styles.backChipText}>Retour aux catégories</Text>
        </Pressable>
      ) : null}

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          loading ? (
            <View style={styles.row}>
              <SkeletonBlock width="100%" height={210} style={styles.skeletonCard} />
              <SkeletonBlock width="100%" height={210} style={styles.skeletonCard} />
            </View>
          ) : (
            <Text style={styles.empty}>Aucun produit trouvé.</Text>
          )
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => {
              setSelectedProduct(item);
              setSelectedMenuItem(menuItems.find((menuItem) => menuItem.id === item.id) ?? null);
            }}
          >
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
            {item.badge ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            ) : null}
            <View style={styles.body}>
              <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
              <Text style={styles.seller}>{item.seller}</Text>
              <Text style={styles.price}>{formatPrice(item.price)}</Text>
            </View>
          </Pressable>
        )}
      />

      <ProductDetailModal
        visible={selectedProduct != null}
        onClose={() => setSelectedProduct(null)}
        id={selectedProduct?.id ?? ''}
        imageUrl={selectedProduct?.imageUrl}
        name={selectedProduct?.name ?? ''}
        price={selectedProduct?.price ?? 0}
        categoryLabel={selectedProduct?.category}
        seller={selectedProduct?.seller}
        onAddToCart={handleModalAdd}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hero: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  heroTitle: { color: '#fff', fontFamily: fonts.titleBold, fontSize: 20, textAlign: 'center' },
  backChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.full,
  },
  backChipText: { color: colors.primary, fontFamily: fonts.bodyBold, fontSize: 12 },
  list: { padding: spacing.lg, paddingBottom: 120, gap: spacing.md },
  row: { gap: spacing.md },
  skeletonCard: { flex: 1, borderRadius: radius.lg },
  empty: { textAlign: 'center', color: colors.textMuted, fontFamily: fonts.bodyMedium, marginTop: spacing.xl },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  image: { width: '100%', height: 130, backgroundColor: colors.border },
  badge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: { color: '#fff', fontFamily: fonts.bodyBold, fontSize: 10 },
  body: { padding: spacing.md },
  name: { color: colors.secondary, fontFamily: fonts.titleSemiBold, fontSize: 13 },
  seller: { color: colors.textMuted, fontFamily: fonts.bodyMedium, fontSize: 11, marginTop: 4 },
  price: { color: colors.primary, fontFamily: fonts.titleBold, fontSize: 13, marginTop: spacing.sm },
});
