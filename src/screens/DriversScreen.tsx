import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import type { MockDriver } from '../mocks/data';
import { getMockDrivers } from '../mocks/service';
import { colors, fonts, radius, shadows, spacing } from '../theme';
import FloatingBackButton from '../components/FloatingBackButton';

type Props = NativeStackScreenProps<RootStackParamList, 'Drivers'>;

export default function DriversScreen({ navigation }: Props) {
  const [drivers, setDrivers] = useState<MockDriver[]>([]);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    getMockDrivers().then(setDrivers);
  }, []);

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
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => navigation.navigate('DriverDetail', { id: item.id })}>
            <View style={styles.headerRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.firstName[0]}{item.lastName[0]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
                <Text style={styles.zone}>{item.zone}</Text>
              </View>
              <View style={styles.availability}>
                <View style={styles.dot} />
                <Text style={styles.availabilityText}>Disponible</Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              <Meta icon="bicycle-outline" text={item.type} />
              <Meta icon="time-outline" text={`${item.etaMinutes} min`} />
              <Meta icon="star" text={item.rating.toFixed(1)} />
            </View>

            <View style={styles.ctaCard}>
              <MaterialCommunityIcons name="lightning-bolt-outline" size={18} color={colors.primary} />
              <Text style={styles.ctaText}>Disponible pour une course rapide maintenant</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

function Meta({ icon, text }: { icon: any; text: string }) {
  return (
    <View style={styles.metaPill}>
      <Ionicons name={icon} size={14} color={colors.textMuted} />
      <Text style={styles.metaText}>{text}</Text>
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
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.md,
    gap: spacing.md,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontFamily: fonts.titleBold, fontSize: 18 },
  name: { color: colors.secondary, fontFamily: fonts.titleBold, fontSize: 16 },
  zone: { color: colors.textMuted, fontFamily: fonts.bodyMedium, fontSize: 12, marginTop: 3 },
  availability: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
  availabilityText: { color: colors.success, fontFamily: fonts.bodyBold, fontSize: 11 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.background,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  metaText: { color: colors.secondary, fontFamily: fonts.bodyMedium, fontSize: 12 },
  ctaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  ctaText: { color: colors.secondary, fontFamily: fonts.bodyBold, fontSize: 13, flex: 1 },
});
