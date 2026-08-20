import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, fonts, radius, shadows, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Categories'>;

const CATEGORIES = [
  { key: 'boissons', label: 'Boissons', subtitle: 'Jus frais, sodas, eau, boissons locales', lib: 'ion', icon: 'wine-outline', bg: '#E0F2FE', color: '#0284C7' },
  { key: 'boucherie', label: 'Boucherie', subtitle: 'Viandes fraîches et découpes prêtes à cuisiner', lib: 'mci', icon: 'food-steak', bg: '#FEE2E2', color: '#DC2626' },
  { key: 'volailles', label: 'Volailles', subtitle: 'Poulet, pintade et produits fermiers', lib: 'mci', icon: 'food-drumstick-outline', bg: '#FEF3C7', color: '#D97706' },
  { key: 'fruits', label: 'Fruits', subtitle: 'Mangues, bananes, ananas et fruits de saison', lib: 'ion', icon: 'nutrition-outline', bg: '#ECFCCB', color: '#65A30D' },
  { key: 'legumes', label: 'Légumes', subtitle: 'Produits du potager, feuilles et assortiments', lib: 'mci', icon: 'carrot', bg: '#DCFCE7', color: '#16A34A' },
  { key: 'epicerie', label: 'Epicerie', subtitle: 'Essentiels du quotidien et paniers famille', lib: 'feather', icon: 'shopping-bag', bg: '#EDE9FE', color: '#7C3AED' },
  { key: 'boulangerie', label: 'Boulangerie', subtitle: 'Pain, croissants et douceurs du matin', lib: 'mci', icon: 'bread-slice-outline', bg: '#FFF7E6', color: '#D97706' },
  { key: 'dessert', label: 'Desserts', subtitle: 'Gâteaux maison et créations sucrées', lib: 'mci', icon: 'cake-variant-outline', bg: '#FCE7F3', color: '#DB2777' },
];

const CATEGORY_ROWS = CATEGORIES.reduce<typeof CATEGORIES[number][][]>((rows, category, index) => {
  if (index % 2 === 0) {
    rows.push([category]);
  } else {
    rows[rows.length - 1].push(category);
  }
  return rows;
}, []);

export default function CategoriesScreen({ navigation, route }: Props) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={[colors.secondary, colors.secondaryDark]} style={styles.hero}>
        <View style={styles.heroGlow} />
        <Text style={styles.heroEyebrow}>Catalogue</Text>
        <Text style={styles.heroTitle}>Catégories</Text>
        <View style={styles.heroPills}>
          <View style={styles.heroPill}>
            <Text style={styles.heroPillText}>8 univers</Text>
          </View>
          <View style={styles.heroPill}>
            <Text style={styles.heroPillText}>Market Biso</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.grid}>
        {CATEGORY_ROWS.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.gridRow}>
            {row.map((category) => {
              const selected = route.params?.selectedCategory === category.key;
              return (
                <Pressable
                  key={category.key}
                  style={[styles.card, selected && styles.cardSelected]}
                  onPress={() => navigation.navigate('Products', { category: category.label })}
                >
                  <LinearGradient colors={['rgba(255,255,255,0.85)', '#FFFFFF']} style={styles.cardGradient}>
                    <View style={[styles.cardAccent, { backgroundColor: category.bg }]} />
                    <View style={[styles.iconWrap, { backgroundColor: category.bg }]}>
                      {category.lib === 'mci' ? (
                        <MaterialCommunityIcons name={category.icon as any} size={24} color={category.color} />
                      ) : category.lib === 'feather' ? (
                        <Feather name={category.icon as any} size={22} color={category.color} />
                      ) : (
                        <Ionicons name={category.icon as any} size={22} color={category.color} />
                      )}
                    </View>
                    <Text style={styles.cardTitle}>{category.label}</Text>
                    <Text style={styles.cardMeta}>Voir les produits</Text>
                    <View style={styles.cardArrow}>
                      <Ionicons name="arrow-forward" size={16} color="#fff" />
                    </View>
                  </LinearGradient>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxl },
  hero: {
    paddingTop: 24,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(254,100,0,0.16)',
    top: -30,
    right: -40,
  },
  heroEyebrow: { color: 'rgba(255,255,255,0.72)', fontFamily: fonts.bodyBold, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.4 },
  heroTitle: { color: '#fff', fontFamily: fonts.titleBold, fontSize: 30, marginTop: 6 },
  heroPills: { flexDirection: 'row', gap: 10, marginTop: spacing.md },
  heroPill: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  heroPillText: { color: '#fff', fontFamily: fonts.bodyBold, fontSize: 12 },
  grid: { padding: spacing.lg, marginTop: spacing.xs, gap: spacing.md },
  gridRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  card: {
    flex: 1,
    borderRadius: radius.lg,
    ...shadows.md,
    overflow: 'hidden',
  },
  cardSelected: {
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  cardGradient: {
    padding: spacing.lg,
    minHeight: 176,
  },
  cardAccent: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 24,
    top: -10,
    right: -10,
    opacity: 0.75,
  },
  iconWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  cardTitle: { color: colors.secondary, fontFamily: fonts.titleBold, fontSize: 18 },
  cardMeta: { color: colors.textMuted, fontFamily: fonts.bodyBold, fontSize: 12, marginTop: 6 },
  cardArrow: {
    marginTop: 'auto',
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
