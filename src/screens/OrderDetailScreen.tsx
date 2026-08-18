import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useCancelOrderMutation, useOrderQuery } from '../graphql/operations';
import type { OrderStatus } from '../graphql/types';
import { colors, radius, spacing } from '../theme';
import { Button, EmptyState, formatDateTime, formatPrice, Spinner, StatusBadge } from '../components/ui';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderDetail'>;

const STEPS: { status: OrderStatus; label: string }[] = [
  { status: 'PENDING', label: 'Commande reçue' },
  { status: 'CONFIRMED', label: 'Confirmée' },
  { status: 'PREPARING', label: 'En préparation' },
  { status: 'IN_TRANSIT', label: 'En livraison' },
  { status: 'DELIVERED', label: 'Livrée' },
];

const CANCELLABLE: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PREPARING'];

export default function OrderDetailScreen({ navigation, route }: Props) {
  const { id } = route.params;
  const { data, loading, error } = useOrderQuery({
    variables: { id },
  });
  const [cancelOrder, { loading: cancelling }] = useCancelOrderMutation();
  const [cancelError, setCancelError] = useState<string | null>(null);

  const order = data?.order;

  if (loading) return <Spinner />;
  if (error || !order) {
    return (
      <View style={styles.container}>
        <EmptyState title="Commande introuvable" subtitle="Cette commande n\u2019existe pas ou a été supprimée." />
      </View>
    );
  }

  const handleCancel = async () => {
    setCancelError(null);
    try {
      await cancelOrder({ variables: { id } });
    } catch (e) {
      setCancelError('Impossible d\u2019annuler cette commande.');
    }
  };

  const currentStepIndex = STEPS.findIndex((s) => s.status === order.status);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.title}>Commande #{order.id.slice(0, 8)}</Text>
          <StatusBadge status={order.status} />
        </View>
        <Text style={styles.date}>{formatDateTime(order.createdAt)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Suivi</Text>
        {STEPS.map((step, index) => {
          const done = index <= currentStepIndex;
          const current = index === currentStepIndex;
          return (
            <View key={step.status} style={styles.stepRow}>
              <View style={styles.stepIndicator}>
                <View style={[styles.stepDot, done && styles.stepDotDone, current && styles.stepDotCurrent]} />
                {index < STEPS.length - 1 ? (
                  <View style={[styles.stepLine, done && styles.stepLineDone]} />
                ) : null}
              </View>
              <Text style={[styles.stepLabel, done && styles.stepLabelDone]}>{step.label}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Articles</Text>
        {order.items.map((item, index) => (
          <View key={item.menuItem?.id ?? index} style={styles.line}>
            <View style={styles.lineBody}>
              <Text style={styles.lineName}>{item.menuItem?.name ?? 'Article'}</Text>
              <Text style={styles.lineQty}>x{item.quantity}</Text>
            </View>
            <Text style={styles.linePrice}>{formatPrice(item.unitPrice * item.quantity)}</Text>
          </View>
        ))}
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Sous-total</Text>
            <Text style={styles.summaryValue}>{formatPrice(order.total)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Livraison</Text>
            <Text style={styles.summaryValue}>{formatPrice(order.deliveryFee)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryTotalRow]}>
            <Text style={styles.summaryTotalLabel}>Total</Text>
            <Text style={styles.summaryTotalValue}>{formatPrice(order.grandTotal)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Livraison</Text>
        <Text style={styles.deliveryText}>
          {order.deliveryAddress}, {order.deliveryZipCode} {order.deliveryCity}
        </Text>
        <Text style={styles.deliveryText}>
          Paiement à la livraison ·{' '}
          {order.payment?.status === 'PAID' ? 'payé' : 'à régler'}
        </Text>
        {order.delivery?.driver ? (
          <Text style={styles.deliveryText}>
            Livreur : {order.delivery.driver.firstName} {order.delivery.driver.lastName}
            {order.delivery.driver.phone ? ` · ${order.delivery.driver.phone}` : ''}
          </Text>
        ) : null}
      </View>

      {CANCELLABLE.includes(order.status) && (
        <Button
          title="Annuler la commande"
          variant="danger"
          onPress={handleCancel}
          loading={cancelling}
          style={styles.cancel}
        />
      )}
      {cancelError ? <Text style={styles.error}>{cancelError}</Text> : null}
    </ScrollView>
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
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '800', color: colors.text },
  date: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start' },
  stepIndicator: { width: 24, alignItems: 'center' },
  stepDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.border,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  stepDotDone: { backgroundColor: colors.success },
  stepDotCurrent: { backgroundColor: colors.primary },
  stepLine: {
    width: 2,
    flex: 1,
    minHeight: 18,
    backgroundColor: colors.border,
    marginVertical: 2,
  },
  stepLineDone: { backgroundColor: colors.success },
  stepLabel: { fontSize: 14, color: colors.textMuted, marginLeft: spacing.sm, marginBottom: spacing.sm, paddingTop: 0 },
  stepLabelDone: { color: colors.text, fontWeight: '600' },
  line: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  lineBody: { flex: 1 },
  lineName: { fontSize: 14, color: colors.text },
  lineQty: { fontSize: 13, color: colors.textMuted },
  linePrice: { fontSize: 14, fontWeight: '600', color: colors.text },
  summary: { marginTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  summaryLabel: { fontSize: 14, color: colors.textMuted },
  summaryValue: { fontSize: 14, color: colors.text },
  summaryTotalRow: { marginTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm },
  summaryTotalLabel: { fontSize: 16, fontWeight: '800', color: colors.text },
  summaryTotalValue: { fontSize: 16, fontWeight: '800', color: colors.primary },
  deliveryText: { fontSize: 14, color: colors.text, marginTop: 4 },
  cancel: { marginTop: spacing.sm },
  error: { color: colors.danger, fontSize: 14, marginTop: spacing.md },
});
