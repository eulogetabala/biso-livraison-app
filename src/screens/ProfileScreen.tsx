import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../lib/auth';
import { assetUrl } from '../lib/api';
import { colors, radius, spacing } from '../theme';
import { Button } from '../components/ui';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Profile'>,
  NativeStackScreenProps<RootStackParamList>
>;

const ROLE_LABELS: Record<string, string> = {
  CLIENT: 'Client',
  PARTNER: 'Partenaire',
  DRIVER: 'Livreur',
  ADMIN: 'Administrateur',
};

export default function ProfileScreen({ navigation }: Props) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigation.replace('Login');
  };

  if (!user) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.userRow}>
          {user.avatarUrl ? (
            <Image source={{ uri: assetUrl(user.avatarUrl) }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitial}>
                {(user.firstName?.[0] ?? '?').toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user.firstName} {user.lastName}
            </Text>
            <Text style={styles.userRole}>{ROLE_LABELS[user.role] ?? user.role}</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Informations</Text>
        <InfoRow label="Email" value={user.email} />
        <InfoRow label="Téléphone" value={user.phone} />
      </View>

      <Button title="Se déconnecter" variant="outline" onPress={handleLogout} style={styles.logout} />
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.border },
  avatarPlaceholder: { backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { color: '#fff', fontSize: 28, fontWeight: '800' },
  userInfo: { flex: 1 },
  userName: { fontSize: 20, fontWeight: '800', color: colors.text },
  userRole: { fontSize: 14, color: colors.textMuted, marginTop: 2 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  infoLabel: { fontSize: 14, color: colors.textMuted },
  infoValue: { fontSize: 14, fontWeight: '600', color: colors.text, flex: 1, textAlign: 'right', marginLeft: spacing.md },
  logout: { marginTop: spacing.sm },
});
