import React from 'react';
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, fonts, radius, shadows, spacing } from '../theme';
import FloatingBackButton from '../components/FloatingBackButton';

type Props = NativeStackScreenProps<RootStackParamList, 'Categories'>;

const CATEGORIES = [
  {
    key: 'boissons',
    label: 'Boissons',
    subtitle: 'Jus frais, sodas, eau',
    image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?q=80&w=900&auto=format&fit=crop',
  },
  {
    key: 'boucherie',
    label: 'Boucherie',
    subtitle: 'Viandes fraîches',
    image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?q=80&w=900&auto=format&fit=crop',
  },
  {
    key: 'volailles',
    label: 'Volailles',
    subtitle: 'Poulet, pintade, fermiers',
    image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?q=80&w=900&auto=format&fit=crop',
  },
  {
    key: 'fruits',
    label: 'Fruits',
    subtitle: 'Mangues, bananes, ananas',
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=900&auto=format&fit=crop',
  },
  {
    key: 'legumes',
    label: 'Légumes',
    subtitle: 'Produits du potager',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=900&auto=format&fit=crop',
  },
  {
    key: 'epicerie',
    label: 'Epicerie',
    subtitle: 'Essentiels du quotidien',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=900&auto=format&fit=crop',
  },
  {
    key: 'boulangerie',
    label: 'Boulangerie',
    subtitle: 'Pain, croissants du matin',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=900&auto=format&fit=crop',
  },
  {
    key: 'dessert',
    label: 'Desserts',
    subtitle: 'Gâteaux et douceurs',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=900&auto=format&fit=crop',
  },
];

export default function CategoriesScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={[colors.secondary, colors.secondaryDark]} style={[styles.hero, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.heroTitle}>Catégories</Text>
      </LinearGradient>

      <View style={styles.grid}>
        {CATEGORIES.map((category) => (
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
                <Text style={styles.cardSubtitle} numberOfLines={2}>
                  {category.subtitle}
                </Text>
                <View style={styles.cardFooter}>
                  <View style={styles.countChip}>
                    <Text style={styles.countChipText}>Explorer</Text>
                  </View>
                </View>
              </View>
            </ImageBackground>
          </Pressable>
        ))}
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
  heroTitle: { color: '#fff', fontFamily: fonts.titleBold, fontSize: 22 },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.lg,
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  cardWrap: {
    width: '48%',
    flexGrow: 1,
    borderRadius: radius.lg,
    ...shadows.md,
  },
  cardPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.92,
  },
  card: {
    height: 190,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  cardImage: {
    borderRadius: radius.lg,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  cardContent: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
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
