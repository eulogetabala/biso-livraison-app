import React from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { mockRestaurants } from '../mocks/data';
import { assetUrl } from '../lib/api';
import { colors, fonts, radius, shadows, spacing } from '../theme';
import FloatingBackButton from '../components/FloatingBackButton';

type Props = NativeStackScreenProps<RootStackParamList, 'Restaurants'>;

export default function RestaurantsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.secondary, colors.secondaryDark]} style={[styles.hero, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.heroTitle}>Tous les restaurants</Text>
      </LinearGradient>
      <FloatingBackButton navigation={navigation} />

      <FlatList
        data={mockRestaurants}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate('Restaurant', { id: item.id, name: item.name })}
          >
            <Image source={{ uri: assetUrl(item.imageUrl ?? item.coverImageUrl) || undefined }} style={styles.image} />
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.74)']} style={styles.overlay} />
            <View style={styles.rating}>
              <Ionicons name="star" size={12} color="#fff" />
              <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
            </View>
            <View style={styles.body}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>{item.cuisineType} · {item.city}</Text>
              <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
            </View>
          </Pressable>
        )}
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
  list: { padding: spacing.lg, gap: spacing.md, paddingBottom: 120 },
  card: {
    height: 220,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    ...shadows.lg,
  },
  image: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFill },
  rating: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(14,23,38,0.45)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: radius.full,
  },
  ratingText: { color: '#fff', fontFamily: fonts.bodyBold, fontSize: 12 },
  body: { position: 'absolute', left: spacing.lg, right: spacing.lg, bottom: spacing.lg },
  name: { color: '#fff', fontFamily: fonts.titleBold, fontSize: 17 },
  meta: { color: 'rgba(255,255,255,0.76)', fontFamily: fonts.bodyBold, fontSize: 12, marginTop: 4 },
  description: { color: 'rgba(255,255,255,0.84)', fontFamily: fonts.bodyMedium, fontSize: 13, lineHeight: 18, marginTop: spacing.sm },
});
