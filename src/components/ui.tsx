import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, radius, spacing } from '../theme';

export function formatPrice(value: number): string {
  return `${value.toFixed(2)} €`;
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
};

export function Button({ title, onPress, variant = 'primary', loading, disabled, style }: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.button,
        variant === 'outline' && styles.buttonOutline,
        variant === 'ghost' && styles.buttonGhost,
        variant === 'danger' && styles.buttonDanger,
        isDisabled && styles.buttonDisabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? colors.primary : '#fff'} />
      ) : (
        <Text
          style={[
            styles.buttonText,
            (variant === 'outline' || variant === 'ghost') && styles.buttonTextOutline,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const statusStyles: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'En attente', color: '#B45309', bg: '#FEF3C7' },
  CONFIRMED: { label: 'Confirmée', color: '#1D4ED8', bg: '#DBEAFE' },
  PREPARING: { label: 'En préparation', color: '#7C3AED', bg: '#EDE9FE' },
  IN_TRANSIT: { label: 'En livraison', color: '#0369A1', bg: '#E0F2FE' },
  DELIVERED: { label: 'Livrée', color: '#15803D', bg: '#DCFCE7' },
  CANCELLED: { label: 'Annulée', color: '#B91C1C', bg: '#FEE2E2' },
  PICKED_UP: { label: 'Ramassée', color: '#15803D', bg: '#DCFCE7' },
  ASSIGNED: { label: 'Livreur assigné', color: '#4B5563', bg: '#F3F4F6' },
  PAID: { label: 'Payée', color: '#15803D', bg: '#DCFCE7' },
  ACTIVE: { label: 'Actif', color: '#15803D', bg: '#DCFCE7' },
  INACTIVE: { label: 'Inactif', color: '#B91C1C', bg: '#FEE2E2' },
};

export function StatusBadge({ status }: { status: string }) {
  const s = statusStyles[status] ?? { label: status, color: '#4B5563', bg: '#F3F4F6' };
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.badgeText, { color: s.color }]}>{s.label}</Text>
    </View>
  );
}

export function Spinner() {
  return <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />;
}

export function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.empty}>
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
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
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
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextOutline: {
    color: colors.primary,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  spinner: {
    marginVertical: spacing.xl,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
