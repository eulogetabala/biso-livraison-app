import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing, fonts, shadows } from '../theme';

export function formatPrice(value: number): string {
  return `${Math.round(value).toLocaleString('fr-FR')} FCFA`;
}

export function formatDate(value: string): string {
  const d = new Date(value);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(value: string): string {
  const d = new Date(value);
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

type ButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
};

export function Button({ title, onPress, variant = 'primary', loading, disabled, style, icon }: ButtonProps) {
  const isDisabled = disabled || loading;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true, tension: 100, friction: 10 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 40, friction: 8 }).start();
  };

  if (variant === 'primary') {
    return (
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={isDisabled}
          style={[isDisabled && styles.buttonDisabled]}
        >
          <LinearGradient
            colors={['#FF7A1A', colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.button, styles.buttonGradient]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.buttonContent}>
                {icon}
                <Text style={styles.buttonText}>{title}</Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={[
          styles.button,
          variant === 'outline' && styles.buttonOutline,
          variant === 'ghost' && styles.buttonGhost,
          variant === 'danger' && styles.buttonDanger,
          isDisabled && styles.buttonDisabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? colors.primary : '#fff'} />
        ) : (
          <View style={styles.buttonContent}>
            {icon}
            <Text
              style={[
                styles.buttonText,
                (variant === 'outline' || variant === 'ghost') && styles.buttonTextOutline,
              ]}
            >
              {title}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const statusStyles: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  PENDING: { label: 'En attente', color: '#B45309', bg: '#FEF3C7', icon: '⏳' },
  CONFIRMED: { label: 'Confirmée', color: '#1D4ED8', bg: '#DBEAFE', icon: '✓' },
  PREPARING: { label: 'En préparation', color: '#7C3AED', bg: '#EDE9FE', icon: '👨‍🍳' },
  IN_TRANSIT: { label: 'En livraison', color: '#0369A1', bg: '#E0F2FE', icon: '🛵' },
  DELIVERED: { label: 'Livrée', color: '#15803D', bg: '#DCFCE7', icon: '✅' },
  CANCELLED: { label: 'Annulée', color: '#B91C1C', bg: '#FEE2E2', icon: '✕' },
  PICKED_UP: { label: 'Ramassée', color: '#15803D', bg: '#DCFCE7', icon: '📦' },
  ASSIGNED: { label: 'Livreur assigné', color: '#4B5563', bg: '#F3F4F6', icon: '🏍️' },
  PAID: { label: 'Payée', color: '#15803D', bg: '#DCFCE7', icon: '💰' },
  ACTIVE: { label: 'Actif', color: '#15803D', bg: '#DCFCE7', icon: '●' },
  INACTIVE: { label: 'Inactif', color: '#B91C1C', bg: '#FEE2E2', icon: '○' },
};

export function StatusBadge({ status }: { status: string }) {
  const s = statusStyles[status] ?? { label: status, color: '#4B5563', bg: '#F3F4F6', icon: '?' };
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={styles.badgeIcon}>{s.icon}</Text>
      <Text style={[styles.badgeText, { color: s.color }]}>{s.label}</Text>
    </View>
  );
}

export function Spinner() {
  return <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />;
}

export function SkeletonBlock({ width: w, height: h, style }: { width: number | string; height: number; style?: StyleProp<ViewStyle> }) {
  const shimmer = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, [shimmer]);

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] });

  return (
    <Animated.View
      style={[
        { width: w as any, height: h, borderRadius: radius.sm, backgroundColor: colors.border, opacity },
        style,
      ]}
    />
  );
}

export function EmptyState({ title, subtitle, icon }: { title: string; subtitle?: string; icon?: string }) {
  return (
    <View style={styles.empty}>
      {icon ? <Text style={styles.emptyIcon}>{icon}</Text> : null}
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle ? <Text style={styles.emptySubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonGradient: {
    backgroundColor: undefined,
    ...shadows.glow(colors.primary),
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  buttonDanger: {
    backgroundColor: colors.danger,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: fonts.titleSemiBold,
  },
  buttonTextOutline: {
    color: colors.primary,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  badgeIcon: {
    fontSize: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: fonts.bodyBold,
  },
  spinner: {
    marginVertical: spacing.xl,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
    paddingHorizontal: spacing.lg,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    fontFamily: fonts.titleBold,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    fontFamily: fonts.bodyMedium,
    lineHeight: 20,
  },
});
