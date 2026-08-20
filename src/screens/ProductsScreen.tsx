import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import type { MockProduct } from '../mocks/data';
import { getMockProducts } from '../mocks/service';
import { colors, fonts, radius, shadows, spacing } from '../theme';
import { formatPrice } from '../components/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'Products'>;

export default function ProductsScreen({ route, navigation }: Props) {
  const [products, setProducts] = useState<MockProduct[]>([]);
  const selectedCategory = route.params?.category;

  useEffect(() => {
    getMockProducts().then(setProducts);
  }, []);

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return products;
    return products.filter((product) => product.category.toLowerCase() === selectedCategory.toLowerCase());
  }, [products, selectedCategory]);

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.secondary, colors.secondaryDark]} style={styles.hero}>
        <Text style={styles.heroTitle}>{selectedCategory ? selectedCategory : 'Tous les produits'}</Text>
        <Text style={styles.heroSubtitle}>
          {selectedCategory ? `Une sélection dédiée à la catégorie ${selectedCategory.toLowerCase()}.` : 'Boissons, volailles, fruits, légumes, épicerie et achats de proximité.'}
        </Text>
      </LinearGradient>

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
          <View style={styles.card}>
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
          </View>
        )}
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
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  heroTitle: { color: '#fff', fontFamily: fonts.titleBold, fontSize: 26 },
  heroSubtitle: { color: 'rgba(255,255,255,0.72)', fontFamily: fonts.bodyMedium, fontSize: 13, marginTop: 6 },
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
  list: { padding: spacing.lg, gap: spacing.md },
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
