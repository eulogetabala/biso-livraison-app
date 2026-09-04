import React, { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useAvailableDriversQuery } from '../graphql/operations';
import { driverToDisplay } from '../lib/drivers-display';
import { colors, fonts, radius, shadows, spacing } from '../theme';
import FloatingBackButton from '../components/FloatingBackButton';
import { EmptyState, SkeletonBlock } from '../components/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'Drivers'>;

const TYPE_META: Record<string, { icon: any; tint: string; iconColor: string }> = {
  Express: { icon: 'speedometer-outline', tint: '#FEF3C7', iconColor: '#D97706' },
  Moto: { icon: 'bicycle-outline', tint: '#E0F2FE', iconColor: '#0284C7' },
  Interville: { icon: 'swap-horizontal', tint: '#EDE9FE', iconColor: '#7C3AED' },
};

export default function DriversScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { data, loading, error } = useAvailableDriversQuery();

  const drivers = useMemo(
    () => (data?.availableDrivers ?? []).map(driverToDisplay),
    [data],
  );

  if (loading && !data) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={[colors.secondary, colors.secondaryDark]} style={[styles.hero, { paddingTop: insets.top + 16 }]}>
          <Text style={styles.heroTitle}>Livreurs disponibles</Text>
        </LinearGradient>
        <FloatingBackButton navigation={navigation} />
        <View style={styles.skeletonList}>
          <SkeletonBlock width="100%" height={76} style={styles.skeletonCard} />
          <SkeletonBlock width="100%" height={76} style={styles.skeletonCard} />
          <SkeletonBlock width="100%" height={76} style={styles.skeletonCard} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={[colors.secondary, colors.secondaryDark]} style={[styles.hero, { paddingTop: insets.top + 16 }]}>
          <Text style={styles.heroTitle}>Livreurs disponibles</Text>
        </LinearGradient>
        <FloatingBackButton navigation={navigation} />
        <EmptyState title="Impossible de charger les livreurs" subtitle="Connectez-vous puis réessayez." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.secondary, colors.secondaryDark]} style={[styles.hero, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.heroTitle}>Livreurs disponibles</Text>
      </LinearGradient>

      <FloatingBackButton navigation={navigation} />

      <FlatList
        data={drivers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState title="Aucun livreur disponible" subtitle="Revenez dans quelques minutes." />
        }
        renderItem={({ item }) => {
          const meta = TYPE_META[item.type] ?? TYPE_META.Express;
          return (
            <Pressable
              style={styles.card}
              onPress={() => navigation.navigate('DriverDetail', { id: item.id })}
            >
              <View style={[styles.iconWrap, { backgroundColor: meta.tint }]}>
                <Ionicons name={meta.icon} size={22} color={meta.iconColor} />
              </View>

              <View style={styles.body}>
                <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
                <View style={styles.zoneRow}>
                  <Ionicons name="location-outline" size={13} color={colors.textMuted} />
                  <Text style={styles.zone} numberOfLines={1}>{item.zone}</Text>
                </View>
              </View>

              <View style={styles.statusWrap}>
                <View style={styles.dot} />
                <Text style={styles.statusText}>Disponible</Text>
              </View>

              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          );
        }}
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
  skeletonList: { padding: spacing.lg, gap: spacing.md },
  skeletonCard: { borderRadius: radius.lg },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.md,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1 },
  name: { color: colors.secondary, fontFamily: fonts.titleBold, fontSize: 16 },
  zoneRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  zone: { color: colors.textMuted, fontFamily: fonts.bodyMedium, fontSize: 13, flex: 1 },
  statusWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingRight: spacing.xs,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
  statusText: { color: colors.success, fontFamily: fonts.bodyBold, fontSize: 12 },
});
