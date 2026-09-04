import React, { useMemo } from 'react';
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useActiveMarketCategoriesQuery, useSearchMenuItemsQuery } from '../graphql/operations';
import { countProductsByCategory, mapApiMarketCategories } from '../lib/market-categories';
import { colors, fonts, radius, shadows, spacing } from '../theme';
import FloatingBackButton from '../components/FloatingBackButton';
import { SkeletonBlock } from '../components/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'Categories'>;

export default function CategoriesScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const { data: categoriesData, loading: categoriesLoading } = useActiveMarketCategoriesQuery();
  const { data: menuData, loading: menuLoading } = useSearchMenuItemsQuery({
    variables: { page: 1, limit: 100, input: { simpleProductsOnly: true } },
  });

  const menuItems = menuData?.searchMenuItems.items ?? [];
  const productCounts = useMemo(() => countProductsByCategory(menuItems), [menuItems]);
  const categories = useMemo(
    () => mapApiMarketCategories(categoriesData?.activeMarketCategories ?? [], productCounts),
    [categoriesData, productCounts],
  );

  const loading = categoriesLoading || menuLoading;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[colors.secondary, colors.secondaryDark]} style={[styles.hero, { paddingTop: insets.top + 16 }]}>
          <Text style={styles.heroTitle}>Catégories</Text>
        </LinearGradient>

        <View style={styles.grid}>
          {loading && categories.length === 0 ? (
            <>
              <SkeletonBlock width="48%" height={190} style={styles.skeleton} />
              <SkeletonBlock width="48%" height={190} style={styles.skeleton} />
            </>
          ) : (
            categories.map((category) => (
              <Pressable
                key={category.key}
                onPress={() => navigation.navigate('Products', { category: category.label })}
                style={({ pressed }) => [styles.cardWrap, pressed && styles.cardPressed]}
              >
                <ImageBackground source={{ uri: category.image }} style={styles.card} imageStyle={styles.cardImage}>
                  <View style={styles.overlay} />
                  <View style={styles.cardContent}>
                    <View style={styles.iconBadge}>
                      <Ionicons name="arrow-forward" size={16} color="#fff" />
                    </View>
                    <Text style={styles.cardTitle}>{category.label}</Text>
                    <Text style={styles.cardSubtitle} numberOfLines={2}>{category.subtitle}</Text>
                    <View style={styles.cardFooter}>
                      <View style={styles.countChip}>
                        <Text style={styles.countChipText}>{category.count} produit{category.count > 1 ? 's' : ''}</Text>
                      </View>
                    </View>
                  </View>
                </ImageBackground>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>

      <FloatingBackButton navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { paddingBottom: 120 },
  hero: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    overflow: 'hidden',
  },
  heroTitle: { color: '#fff', fontFamily: fonts.titleBold, fontSize: 20, textAlign: 'center' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.lg,
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  skeleton: { borderRadius: radius.lg, flexGrow: 1 },
  cardWrap: { width: '48%', flexGrow: 1, borderRadius: radius.lg, ...shadows.md },
  cardPressed: { transform: [{ scale: 0.97 }], opacity: 0.92 },
  card: { height: 190, borderRadius: radius.lg, overflow: 'hidden' },
  cardImage: { borderRadius: radius.lg },
  overlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.55)' },
  cardContent: { flex: 1, padding: spacing.md, justifyContent: 'space-between' },
  iconBadge: {
    alignSelf: 'flex-end',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  cardTitle: { color: '#fff', fontFamily: fonts.titleBold, fontSize: 16 },
  cardSubtitle: { color: 'rgba(255,255,255,0.82)', fontFamily: fonts.bodyMedium, fontSize: 12, marginTop: 2, lineHeight: 16 },
  cardFooter: { marginTop: spacing.sm },
  countChip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  countChipText: { color: '#fff', fontFamily: fonts.bodyBold, fontSize: 11 },
});
