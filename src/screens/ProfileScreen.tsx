import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../lib/auth';
import { assetUrl } from '../lib/api';
import { colors, radius, spacing, fonts, shadows } from '../theme';
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
  CLIENT: 'Client Biso',
  PARTNER: 'Partenaire',
  DRIVER: 'Livreur',
  ADMIN: 'Administrateur',
};

export default function ProfileScreen({ navigation }: Props) {
  const { user, logout } = useAuth();

  const slideY = useRef(new Animated.Value(-40)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideY, {
        toValue: 0,
        tension: 50,
        friction: 9,
        useNativeDriver: true,
      }),
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideY, fadeIn]);

  const handleLogout = async () => {
    await logout();
    navigation.replace('Login');
  };

  if (!user) return null;

  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || '?';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Gradient Header Card */}
      <Animated.View style={{ opacity: fadeIn, transform: [{ translateY: slideY }] }}>
        <LinearGradient
          colors={[colors.secondary, colors.secondaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerCard}
        >
          {/* Decorative circles */}
          <View style={[styles.decoCircle, styles.decoCircle1]} />
          <View style={[styles.decoCircle, styles.decoCircle2]} />
          <View style={[styles.decoCircle, styles.decoCircle3]} />

          <View style={styles.headerContent}>
            {/* Avatar with gradient border ring */}
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.avatarRing}
            >
              {user.avatarUrl ? (
                <Image source={{ uri: assetUrl(user.avatarUrl) }} style={styles.avatar as any} />
              ) : (
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark]}
                  style={styles.avatarFallback}
                >
                  <Text style={styles.avatarInitials}>{initials}</Text>
                </LinearGradient>
              )}
            </LinearGradient>

            <Text style={styles.userName}>
              {user.firstName} {user.lastName}
            </Text>

            <View style={styles.rolePill}>
              <Ionicons name="shield-checkmark" size={11} color={colors.primary} />
              <Text style={styles.roleText}>{ROLE_LABELS[user.role] ?? user.role}</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Stats Row */}
      <Animated.View style={[styles.statsRow, { opacity: fadeIn }]}>
        <StatCard icon="person" iconBg={colors.secondaryLight} iconColor={colors.secondary} label={ROLE_LABELS[user.role] ?? 'Membre'} value="Actif" />
        <StatCard icon="calendar" iconBg="#E0F2FE" iconColor="#0EA5E9" label="Membre depuis" value="2024" />
        <StatCard icon="receipt" iconBg={colors.primaryLight} iconColor={colors.primary} label="Commandes" value="—" />
      </Animated.View>

      {/* Info Section */}
      <Animated.View style={[styles.infoCard, { opacity: fadeIn }]}>
        <Text style={styles.infoTitle}>Informations personnelles</Text>

        {user.email ? (
          <InfoRow
            icon="mail"
            iconBg={colors.secondaryLight}
            iconColor={colors.secondary}
            value={user.email}
            isLast={!user.phone}
          />
        ) : null}
        {user.phone ? (
          <InfoRow
            icon="call"
            iconBg="#D1FAE5"
            iconColor="#059669"
            value={user.phone}
            isLast
          />
        ) : null}
      </Animated.View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={20} color={colors.danger} />
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function StatCard({ icon, iconBg, iconColor, label, value }: {
  icon: string; iconBg: string; iconColor: string; label: string; value: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon as any} size={18} color={iconColor} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function InfoRow({ icon, iconBg, iconColor, value, isLast }: {
  icon: string; iconBg: string; iconColor: string; value: string; isLast?: boolean;
}) {
  return (
    <View style={[styles.infoRow, !isLast && styles.infoRowBorder]}>
      <View style={styles.infoRowLeft}>
        <View style={[styles.infoIconCircle, { backgroundColor: iconBg }]}>
          <Ionicons name={icon as any} size={18} color={iconColor} />
        </View>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.border} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxl + 40 },

  // Header
  headerCard: {
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    paddingTop: 60,
    paddingBottom: spacing.xl,
    overflow: 'hidden',
  },
  headerContent: { alignItems: 'center', zIndex: 1 },
  decoCircle: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  decoCircle1: { width: 180, height: 180, top: -40, right: -30 },
  decoCircle2: { width: 120, height: 120, bottom: -20, left: -20 },
  decoCircle3: { width: 80, height: 80, top: 30, left: 60 },

  avatarRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.surface,
  },
  avatarFallback: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.surface,
  },
  avatarInitials: {
    fontSize: 28,
    color: '#FFFFFF',
    fontFamily: fonts.titleBold,
  },
  userName: {
    fontSize: 22,
    color: '#FFFFFF',
    fontFamily: fonts.titleBold,
    marginBottom: spacing.xs,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 4,
  },
  roleText: {
    fontSize: 11,
    color: colors.primary,
    fontFamily: fonts.bodyBold,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginTop: -spacing.md,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm + 2,
    alignItems: 'center',
    ...shadows.md,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: 15,
    color: colors.text,
    fontFamily: fonts.titleBold,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontFamily: fonts.bodyMedium,
    marginTop: 2,
    textAlign: 'center',
  },

  // Info
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  infoTitle: {
    fontSize: 14,
    color: colors.secondary,
    fontFamily: fonts.titleSemiBold,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  infoIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoValue: {
    fontSize: 14,
    color: colors.text,
    fontFamily: fonts.bodyMedium,
    flex: 1,
  },

  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    paddingVertical: 14,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.danger,
    backgroundColor: 'rgba(239,68,68,0.04)',
  },
  logoutText: {
    fontSize: 15,
    color: colors.danger,
    fontFamily: fonts.bodyBold,
  },
});
