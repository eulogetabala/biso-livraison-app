import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import type { MockDriver } from '../mocks/data';
import { getMockDriverById } from '../mocks/service';
import { Button } from '../components/ui';
import { colors, fonts, radius, shadows, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'DriverDetail'>;

export default function DriverDetailScreen({ route }: Props) {
  const [driver, setDriver] = useState<MockDriver | null>(null);

  useEffect(() => {
    getMockDriverById(route.params.id).then(setDriver);
  }, [route.params.id]);

  if (!driver) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.secondary, colors.secondaryDark]} style={styles.hero}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{driver.firstName[0]}{driver.lastName[0]}</Text>
        </View>
        <Text style={styles.name}>{driver.firstName} {driver.lastName}</Text>
        <Text style={styles.subtitle}>{driver.type} disponible dans {driver.zone}</Text>
      </LinearGradient>

      <View style={styles.card}>
        <View style={styles.metricsRow}>
          <Metric icon="time-outline" label="Arrivée" value={`${driver.etaMinutes} min`} />
          <Metric icon="star" label="Note" value={driver.rating.toFixed(1)} />
          <Metric icon="shield-checkmark-outline" label="Statut" value="Vérifié" />
        </View>

        <View style={styles.infoPanel}>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="motorbike" size={18} color={colors.primary} />
            <Text style={styles.infoText}>Idéal pour courses express, repas et petits colis.</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color={colors.primary} />
            <Text style={styles.infoText}>Zone couverte : {driver.zone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="flash-outline" size={18} color={colors.primary} />
            <Text style={styles.infoText}>Réponse rapide et disponibilité immédiate en mode mock.</Text>
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
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hero: {
    paddingTop: 32,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontFamily: fonts.titleBold, fontSize: 28 },
  name: { color: '#fff', fontFamily: fonts.titleBold, fontSize: 26, marginTop: spacing.md },
  subtitle: { color: 'rgba(255,255,255,0.74)', fontFamily: fonts.bodyMedium, fontSize: 13, marginTop: 6 },
  card: {
    margin: spacing.lg,
    marginTop: -spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadows.lg,
  },
  metricsRow: { flexDirection: 'row', gap: spacing.sm },
  metric: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  metricValue: { color: colors.secondary, fontFamily: fonts.titleBold, fontSize: 16, marginTop: 8 },
  metricLabel: { color: colors.textMuted, fontFamily: fonts.bodyMedium, fontSize: 11, marginTop: 4 },
  infoPanel: {
    marginTop: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  infoText: { flex: 1, color: colors.secondary, fontFamily: fonts.bodyMedium, fontSize: 13, lineHeight: 19 },
});
