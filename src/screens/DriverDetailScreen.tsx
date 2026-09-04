import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useDriverQuery } from '../graphql/operations';
import { driverToDisplay } from '../lib/drivers-display';
import { Button, EmptyState, Spinner } from '../components/ui';
import FloatingBackButton from '../components/FloatingBackButton';
import { TAB_BAR_OFFSET } from '../components/AppTabBar';
import { colors, fonts, radius, shadows, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'DriverDetail'>;

const ZONE_BY_TYPE: Record<string, string> = {
  Express: 'Centre-ville',
  Moto: 'Talangaï',
  Interville: 'Brazzaville → Pointe-Noire',
};

export default function DriverDetailScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { data, loading, error } = useDriverQuery({
    variables: { id: route.params.id },
  });

  if (loading && !data) {
    return (
      <View style={styles.container}>
        <Spinner />
      </View>
    );
  }

  if (error || !data?.driver) {
    return (
      <View style={styles.container}>
        <EmptyState title="Livreur introuvable" subtitle="Ce livreur n'est plus disponible." />
      </View>
    );
  }

  const driver = driverToDisplay(data.driver);
  const zone = ZONE_BY_TYPE[driver.type] ?? driver.zone;

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.secondary, colors.secondaryDark]} style={[styles.hero, { paddingTop: insets.top + 24 }]}>
        <View style={styles.heroIconWrap}>
          <Ionicons
            name={driver.type === 'Moto' ? 'bicycle' : driver.type === 'Interville' ? 'swap-horizontal' : 'speedometer'}
            size={30}
            color="#fff"
          />
        </View>
        <Text style={styles.name}>{driver.firstName} {driver.lastName}</Text>
        <View style={styles.statusPill}>
          <View style={styles.statusDot} />
          <Text style={styles.statusPillText}>Disponible maintenant</Text>
        </View>
      </LinearGradient>

      <FloatingBackButton navigation={navigation} />

      <View style={styles.card}>
        <View style={styles.metricsRow}>
          <Metric icon="time-outline" label="Arrivée" value={`${driver.etaMinutes} min`} />
          <Metric icon="star" label="Note" value={driver.rating.toFixed(1)} />
          <Metric icon="bicycle-outline" label="Type" value={driver.type} />
        </View>

        <View style={styles.infoPanel}>
          <View style={styles.infoRow}>
            <View style={styles.infoDot} />
            <Text style={styles.infoText}>Disponible maintenant pour prendre votre course.</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="motorbike" size={18} color={colors.primary} />
            <Text style={styles.infoText}>
              Livreur {driver.type === 'Interville' ? 'interville' : driver.type === 'Moto' ? 'en moto' : 'express'}.
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color={colors.primary} />
            <Text style={styles.infoText}>Zone couverte : {zone}</Text>
          </View>
        </View>

        <Button title="Choisir ce livreur" style={{ marginTop: spacing.lg }} />
      </View>
    </View>
  );
}

function Metric({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Ionicons name={icon} size={18} color={colors.primary} />
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingBottom: TAB_BAR_OFFSET },
  hero: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  heroIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  name: { color: '#fff', fontFamily: fonts.titleBold, fontSize: 24 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
  statusPillText: { color: '#fff', fontFamily: fonts.bodyBold, fontSize: 13 },
  card: {
    margin: spacing.lg,
    marginTop: -28,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadows.lg,
  },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  metric: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    gap: 4,
  },
  metricLabel: { color: colors.textMuted, fontFamily: fonts.bodyMedium, fontSize: 12 },
  metricValue: { color: colors.secondary, fontFamily: fonts.titleBold, fontSize: 15 },
  infoPanel: {
    marginTop: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  infoDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
  infoText: { flex: 1, color: colors.text, fontFamily: fonts.bodyMedium, fontSize: 14 },
});
