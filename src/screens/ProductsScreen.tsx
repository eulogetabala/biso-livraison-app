import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import type { MockProduct } from '../mocks/data';
import { getMockProducts } from '../mocks/service';
import { colors, fonts, radius, shadows, spacing } from '../theme';
import { formatPrice } from '../components/ui';
import ProductDetailModal from '../components/ProductDetailModal';
import { MARKET_RESTAURANT_ID, MARKET_RESTAURANT_NAME, menuItemFromProduct } from '../lib/cart-helpers';
import { useCart } from '../lib/cart';
import FloatingBackButton from '../components/FloatingBackButton';

type Props = NativeStackScreenProps<RootStackParamList, 'Products'>;

export default function ProductsScreen({ route, navigation }: Props) {
  const [products, setProducts] = useState<MockProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<MockProduct | null>(null);
  const selectedCategory = route.params?.category;
  const { addItem } = useCart();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    getMockProducts().then(setProducts);
  }, []);

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return products;
    return products.filter((product) => product.category.toLowerCase() === selectedCategory.toLowerCase());
  }, [products, selectedCategory]);

  const handleModalAdd = (quantity: number) => {
    if (!selectedProduct) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addItem(
      menuItemFromProduct(selectedProduct),
      MARKET_RESTAURANT_ID,
      MARKET_RESTAURANT_NAME,
      0,
      undefined,
      quantity,
    );
    setSelectedProduct(null);
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
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => setSelectedProduct(item)}>
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
            {item.badge ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            ) : null}
            <View style={styles.body}>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.seller}>{item.seller}</Text>
              <View style={styles.footer}>
                <Text style={styles.price}>{formatPrice(item.price)}</Text>
                <View style={styles.distance}>
                  <Ionicons name="location-outline" size={13} color={colors.textMuted} />
                  <Text style={styles.distanceText}>{item.distanceKm.toFixed(1)} km</Text>
                </View>
              </View>
            </View>
          </Pressable>
        )}
      />

      {/* Fiche produit */}
      <ProductDetailModal
        visible={selectedProduct != null}
        onClose={() => setSelectedProduct(null)}
        id={selectedProduct?.id ?? ''}
        imageUrl={selectedProduct?.imageUrl}
        name={selectedProduct?.name ?? ''}
        price={selectedProduct?.price ?? 0}
        badge={selectedProduct?.badge}
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
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  heroTitle: { color: '#fff', fontFamily: fonts.titleBold, fontSize: 20, textAlign: 'center' },
  backChip: {
    marginTop: spacing.md,
    marginHorizontal: spacing.lg,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backChipText: { color: colors.primary, fontFamily: fonts.bodyBold, fontSize: 12 },
  list: { padding: spacing.lg, gap: spacing.md, paddingBottom: 120 },
  row: { gap: spacing.md },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  image: { width: '100%', height: 150, backgroundColor: colors.border },
  badge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: { color: '#fff', fontFamily: fonts.bodyBold, fontSize: 11 },
  body: { padding: spacing.md },
  name: { color: colors.secondary, fontFamily: fonts.titleSemiBold, fontSize: 15 },
  seller: { color: colors.textMuted, fontFamily: fonts.bodyMedium, fontSize: 12, marginTop: 4 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  price: { color: colors.primary, fontFamily: fonts.titleBold, fontSize: 14 },
  distance: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  distanceText: { color: colors.textMuted, fontFamily: fonts.bodyBold, fontSize: 11 },
});
