import React, { useState, useEffect, useRef } from 'react';
import {
  Animated,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useCancelOrderMutation, useOrderQuery } from '../graphql/operations';
import type { OrderStatus } from '../graphql/types';
import { MOCK_MODE } from '../config/mock';
import { cancelMockOrder, getMockOrderById } from '../mocks/service';
import { colors, radius, spacing, fonts, shadows } from '../theme';
import { Button, EmptyState, formatDateTime, formatPrice, Spinner, StatusBadge } from '../components/ui';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderDetail'>;

const STEPS: { status: OrderStatus; label: string; icon: string }[] = [
  { status: 'PENDING', label: 'Commande reçue', icon: 'clipboard-outline' },
  { status: 'CONFIRMED', label: 'Confirmée', icon: 'checkmark-circle-outline' },
  { status: 'PREPARING', label: 'En préparation', icon: 'restaurant-outline' },
  { status: 'IN_TRANSIT', label: 'En livraison', icon: 'bicycle-outline' },
  { status: 'DELIVERED', label: 'Livrée', icon: 'home-outline' },
];

const CANCELLABLE: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PREPARING'];

export default function OrderDetailScreen({ navigation, route }: Props) {
  const { id } = route.params;
  const { data, loading, error, refetch } = useOrderQuery({
    variables: { id },
    pollInterval: 5000,
    skip: MOCK_MODE,
  });
  const [cancelOrder, { loading: cancelling }] = useCancelOrderMutation();
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [mockRefreshTick, setMockRefreshTick] = useState(0);

  const pulseScale = useRef(new Animated.Value(0.8)).current;
  const pulseOpacity = useRef(new Animated.Value(0.8)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;
  const totalScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseScale, { toValue: 2.4, duration: 1400, useNativeDriver: true }),
          Animated.timing(pulseOpacity, { toValue: 0, duration: 1400, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(pulseScale, { toValue: 0.8, duration: 0, useNativeDriver: true }),
          Animated.timing(pulseOpacity, { toValue: 0.8, duration: 0, useNativeDriver: true }),
        ]),
      ]),
    ).start();
  }, [pulseScale, pulseOpacity]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, tension: 60, friction: 12, useNativeDriver: true }),
    ]).start();
  }, [fadeIn, slideUp]);

  const order = MOCK_MODE ? getMockOrderById(String(id)) : data?.order;

  if ((!MOCK_MODE && loading && !data)) return <Spinner />;
  if ((!MOCK_MODE && error) || !order) {
    return (
      <View style={styles.container}>
        <EmptyState title="Commande introuvable" subtitle="Cette commande n'existe pas ou a été supprimée." />
      </View>
    );
  }

  const handleCancel = async () => {
    setCancelError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      if (MOCK_MODE) {
        await cancelMockOrder(id);
        setMockRefreshTick((value) => value + 1);
        return;
      }
      await cancelOrder({ variables: { id } });
      refetch();
    } catch (e) {
      setCancelError('Impossible d\u2019annuler cette commande.');
    }
  };

  const handleCallDriver = (phone: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(`tel:${phone}`);
  };

  const animateTotalBounce = () => {
    Animated.sequence([
      Animated.timing(totalScale, { toValue: 1.08, duration: 150, useNativeDriver: true }),
      Animated.spring(totalScale, { toValue: 1, tension: 200, friction: 10, useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => {
    if (order) animateTotalBounce();
  }, [order?.grandTotal, mockRefreshTick]);

  const currentStepIndex = STEPS.findIndex((s) => s.status === order.status);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Animated.View style={{ opacity: fadeIn, transform: [{ translateY: slideUp }] }}>

        {/* ── Header Card ── */}
        <View style={[styles.card, shadows.md]}>
          <LinearGradient
            colors={[colors.secondary, colors.secondaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <View style={{ flex: 1 }}>
                <Text style={styles.headerOrderId}>Commande #{order.id.slice(0, 8)}</Text>
                <Text style={styles.headerDate}>{formatDateTime(order.createdAt)}</Text>
              </View>
              <StatusBadge status={order.status} />
            </View>
          </LinearGradient>
        </View>

        {/* ── Timeline Card ── */}
        <View style={[styles.card, shadows.md]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconWrap}>
              <Ionicons name="time" size={16} color={colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>Suivi en temps réel</Text>
          </View>

          <View style={styles.timelineContainer}>
            {STEPS.map((step, index) => {
              const done = index <= currentStepIndex;
              const current = index === currentStepIndex;
              const isLast = index === STEPS.length - 1;

              return (
                <View key={step.status} style={styles.stepRow}>
                  <View style={styles.stepIndicatorCol}>
                    {current && (
                      <Animated.View
                        style={[
                          styles.pulseRing,
                          { transform: [{ scale: pulseScale }], opacity: pulseOpacity },
                        ]}
                      />
                    )}
                    {current && <View style={styles.glowRing} />}

                    <View
                      style={[
                        styles.stepDot,
                        done && styles.stepDotDone,
                        current && styles.stepDotCurrent,
                      ]}
                    >
                      {done && !current ? (
                        <Ionicons name="checkmark" size={14} color="#fff" />
                      ) : (
                        <Ionicons name={step.icon as any} size={14} color={done || current ? '#fff' : colors.textMuted} />
                      )}
                    </View>

                    {!isLast && (
                      <LinearGradient
                        colors={
                          done && index < currentStepIndex
                            ? [colors.primary, colors.success]
                            : [colors.border, colors.border]
                        }
                        style={styles.stepLine}
                      />
                    )}
                  </View>

                  <View style={styles.stepLabelContainer}>
                    <Text
                      style={[
                        styles.stepLabel,
                        done && styles.stepLabelDone,
                        current && styles.stepLabelCurrent,
                      ]}
                    >
                      {step.label}
                    </Text>
                    {current && <Text style={styles.stepSublabel}>Étape en cours...</Text>}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* ── Driver Card ── */}
        {order.delivery?.driver && (
          <View style={[styles.card, shadows.lg, shadows.glow(colors.secondary)]}>
            <LinearGradient
              colors={[colors.secondary, colors.secondaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.driverGradient}
            >
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIconWrap, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                  <Ionicons name="bicycle" size={16} color="#fff" />
                </View>
                <Text style={[styles.sectionTitle, { color: '#fff' }]}>Votre livreur</Text>
              </View>

              <View style={styles.driverRow}>
                <View style={styles.driverAvatar}>
                  <Text style={styles.driverInitial}>
                    {order.delivery.driver.firstName[0].toUpperCase()}
                  </Text>
                </View>
                <View style={styles.driverInfo}>
                  <Text style={styles.driverName}>
                    {order.delivery.driver.firstName} {order.delivery.driver.lastName}
                  </Text>
                  {order.delivery.driver.phone ? (
                    <TouchableOpacity
                      style={styles.callButton}
                      onPress={() => handleCallDriver(order.delivery!.driver!.phone!)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="call" size={14} color="#fff" />
                      <Text style={styles.callText}>{order.delivery.driver.phone}</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.driverPhoneNA}>Non renseigné</Text>
                  )}
                </View>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* ── Items Card ── */}
        <View style={[styles.card, shadows.md]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconWrap}>
              <Ionicons name="receipt" size={16} color={colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>Articles commandés</Text>
          </View>

          {order.items.map((item, index) => (
            <View
              key={item.menuItem?.id ?? index}
              style={[styles.itemRow, index < order.items.length - 1 && styles.itemRowBorder]}
            >
              <View style={styles.itemBody}>
                <Text style={styles.itemName}>{item.menuItem?.name ?? 'Article'}</Text>
                <Text style={styles.itemQty}>×{item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>{formatPrice(item.unitPrice * item.quantity)}</Text>
            </View>
          ))}

          <View style={styles.summaryBlock}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Sous-total</Text>
              <Text style={styles.summaryValue}>{formatPrice(order.total)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Frais de livraison</Text>
              <Text style={styles.summaryValue}>
                {order.deliveryFee === 0 ? 'Gratuit' : formatPrice(order.deliveryFee)}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total réglé</Text>
              <Animated.Text style={[styles.totalValue, { transform: [{ scale: totalScale }] }]}>
                {formatPrice(order.grandTotal)}
              </Animated.Text>
            </View>
          </View>
        </View>

        {/* ── Delivery Card ── */}
        <View style={[styles.card, shadows.md]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconWrap}>
              <Ionicons name="location" size={16} color={colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>Détails de livraison</Text>
          </View>

          <View style={styles.deliveryRow}>
            <View style={[styles.deliveryIcon, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="location-sharp" size={18} color={colors.primary} />
            </View>
            <Text style={styles.deliveryAddress}>
              {order.deliveryAddress}, {order.deliveryZipCode} {order.deliveryCity}
            </Text>
          </View>

          <View style={[styles.deliveryRow, { marginTop: spacing.sm }]}>
            <View
              style={[
                styles.deliveryIcon,
                {
                  backgroundColor:
                    order.payment?.status === 'PAID' ? colors.success + '15' : colors.warning + '15',
                },
              ]}
            >
              <Ionicons
                name="card"
                size={18}
                color={order.payment?.status === 'PAID' ? colors.success : colors.warning}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.paymentMethod}>Paiement à la livraison</Text>
              <View style={styles.paymentStatusRow}>
                <View
                  style={[
                    styles.paymentDot,
                    {
                      backgroundColor:
                        order.payment?.status === 'PAID' ? colors.success : colors.warning,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.paymentStatusText,
                    {
                      color: order.payment?.status === 'PAID' ? colors.success : colors.warning,
                    },
                  ]}
                >
                  {order.payment?.status === 'PAID' ? 'Payé' : 'À régler en espèces'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Cancel Button ── */}
        {CANCELLABLE.includes(order.status) && (
          <Button
            title="Annuler la commande"
            variant="danger"
            onPress={handleCancel}
            loading={cancelling}
            style={styles.cancelBtn}
          />
        )}
        {cancelError && <Text style={styles.errorText}>{cancelError}</Text>}

      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },

  /* Header */
  headerGradient: {
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerOrderId: {
    fontSize: 20,
    fontFamily: fonts.titleBold,
    color: '#fff',
  },
  headerDate: {
    fontSize: 12,
    fontFamily: fonts.bodyMedium,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },

  /* Section header */
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  sectionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.xs,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: fonts.titleSemiBold,
    color: colors.secondary,
  },

  /* Timeline */
  timelineContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepIndicatorCol: {
    width: 36,
    alignItems: 'center',
    position: 'relative',
  },
  pulseRing: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary + '30',
    top: -2,
    left: 4,
  },
  glowRing: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary + '12',
    top: -6,
    left: 0,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  stepDotDone: { backgroundColor: colors.success },
  stepDotCurrent: { backgroundColor: colors.primary },
  stepLine: {
    width: 3,
    height: 32,
    borderRadius: 1.5,
    marginVertical: 4,
    zIndex: 1,
  },
  stepLabelContainer: {
    marginLeft: spacing.sm,
    paddingBottom: spacing.lg,
    flex: 1,
    paddingTop: 2,
  },
  stepLabel: {
    fontSize: 14,
    fontFamily: fonts.bodyMedium,
    color: colors.textMuted,
  },
  stepLabelDone: {
    color: colors.secondary,
    fontFamily: fonts.bodyBold,
  },
  stepLabelCurrent: {
    color: colors.primary,
    fontFamily: fonts.titleBold,
  },
  stepSublabel: {
    fontSize: 11,
    fontFamily: fonts.bodyBold,
    color: colors.primary,
    marginTop: 2,
  },

  /* Driver */
  driverGradient: {
    borderRadius: radius.md,
    padding: 0,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  driverAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverInitial: {
    color: '#fff',
    fontSize: 22,
    fontFamily: fonts.titleBold,
  },
  driverInfo: { flex: 1 },
  driverName: {
    color: '#fff',
    fontSize: 17,
    fontFamily: fonts.titleSemiBold,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  callText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: fonts.bodyMedium,
  },
  driverPhoneNA: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontFamily: fonts.bodyMedium,
    marginTop: 4,
  },

  /* Items */
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
  },
  itemRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '60',
  },
  itemBody: { flex: 1 },
  itemName: {
    fontSize: 14,
    fontFamily: fonts.titleSemiBold,
    color: colors.secondary,
  },
  itemQty: {
    fontSize: 12,
    fontFamily: fonts.bodyMedium,
    color: colors.textMuted,
    marginTop: 1,
  },
  itemPrice: {
    fontSize: 14,
    fontFamily: fonts.bodyBold,
    color: colors.secondary,
  },

  /* Summary */
  summaryBlock: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  summaryLabel: {
    fontSize: 13,
    fontFamily: fonts.bodyMedium,
    color: colors.textMuted,
  },
  summaryValue: {
    fontSize: 13,
    fontFamily: fonts.bodyBold,
    color: colors.secondary,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: fonts.titleBold,
    color: colors.secondary,
  },
  totalValue: {
    fontSize: 18,
    fontFamily: fonts.titleBold,
    color: colors.primary,
  },

  /* Delivery */
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  deliveryIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliveryAddress: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.bodyMedium,
    color: colors.secondary,
    lineHeight: 20,
  },
  paymentMethod: {
    fontSize: 14,
    fontFamily: fonts.bodyMedium,
    color: colors.secondary,
  },
  paymentStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  paymentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  paymentStatusText: {
    fontSize: 13,
    fontFamily: fonts.bodyBold,
  },

  /* Cancel */
  cancelBtn: {
    marginTop: spacing.sm,
    height: 52,
    borderRadius: radius.sm,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    fontFamily: fonts.bodyBold,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});
