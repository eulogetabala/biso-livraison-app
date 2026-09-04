import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Animated,
  Dimensions,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useCancelOrderMutation, useOrderQuery, useTrackDeliveryQuery, useTrackingByDeliveryQuery } from '../graphql/operations';
import type { OrderStatus } from '../graphql/types';
import { distanceKmBetween, restaurantCoords } from '../lib/geo-data';
import { colors, radius, spacing, fonts, shadows } from '../theme';
import { Button, EmptyState, formatDateTime, formatPrice, Spinner, StatusBadge } from '../components/ui';
import FloatingBackButton from '../components/FloatingBackButton';
import PhoneNumber from '../components/PhoneNumber';
import DriverLiveMap from '../components/DriverLiveMap';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

const DELIVERY_STATUS_LABELS: Record<string, string> = {
  ASSIGNED: 'Livreur assigné',
  PICKED_UP: 'Commande récupérée',
  IN_TRANSIT: 'En route vers vous',
  DELIVERED: 'Livrée',
};

export default function OrderDetailScreen({ navigation, route }: Props) {
  const { id, confirmation: isConfirmation = false } = route.params;
  const insets = useSafeAreaInsets();
  const { data, loading, error, refetch } = useOrderQuery({
    variables: { id },
    pollInterval: isConfirmation ? undefined : 5000,
  });
  const order = data?.order;
  const hasDriver = !!order?.delivery?.driver;
  const trackable =
    !isConfirmation &&
    !!order &&
    hasDriver &&
    order.status !== 'DELIVERED' &&
    order.status !== 'CANCELLED' &&
    order.status !== 'PENDING';
  const { data: trackData } = useTrackDeliveryQuery({
    variables: { orderId: id },
    skip: !trackable,
    pollInterval: 5000,
  });
  const [cancelOrder, { loading: cancelling }] = useCancelOrderMutation();
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [mapExpanded, setMapExpanded] = useState(false);

  const deliveryId = order?.delivery?.id;
  const { data: trackingData } = useTrackingByDeliveryQuery({
    variables: { deliveryId: deliveryId ?? '' },
    skip: isConfirmation || !deliveryId,
    pollInterval: 10000,
  });
  const trackingEvents = trackingData?.trackingByDelivery ?? [];

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

  const animateTotalBounce = useCallback(() => {
    Animated.sequence([
      Animated.timing(totalScale, { toValue: 1.08, duration: 150, useNativeDriver: true }),
      Animated.spring(totalScale, { toValue: 1, tension: 200, friction: 10, useNativeDriver: true }),
    ]).start();
  }, [totalScale]);

  useEffect(() => {
    if (order?.grandTotal != null) animateTotalBounce();
  }, [order?.grandTotal, animateTotalBounce]);

  if (loading && !data) return <Spinner />;
  if (error || !order) {
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
      await cancelOrder({ variables: { id } });
      if (isConfirmation) {
        goHome();
        return;
      }
      refetch();
    } catch {
      setCancelError('Impossible d\u2019annuler cette commande.');
    }
  };

  const goHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main', params: { screen: 'Home' } }],
    });
  };

  const handleCallDriver = (phone: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(`tel:${phone}`);
  };

  const currentStepIndex = STEPS.findIndex((s) => s.status === order.status);

  const originCoords = restaurantCoords(order.restaurant);
  const destinationCoords =
    order.deliveryLatitude != null && order.deliveryLongitude != null
      ? { latitude: order.deliveryLatitude, longitude: order.deliveryLongitude }
      : null;
  const driverCoords = trackData?.trackDelivery
    ? { latitude: trackData.trackDelivery.latitude, longitude: trackData.trackDelivery.longitude }
    : null;
  const deliveryStatus = order.delivery?.status;
  const mapProgress =
    deliveryStatus === 'IN_TRANSIT' || order.status === 'IN_TRANSIT'
      ? 0.65
      : deliveryStatus === 'PICKED_UP'
        ? 0.45
        : order.status === 'PREPARING'
          ? 0.2
          : order.status === 'CONFIRMED'
            ? 0.08
            : 0.4;
  const etaMinutes =
    driverCoords && destinationCoords
      ? Math.max(5, Math.round((distanceKmBetween(driverCoords, destinationCoords) / 18) * 60))
      : originCoords && destinationCoords
        ? Math.max(8, Math.round((distanceKmBetween(originCoords, destinationCoords) / 18) * 60))
        : undefined;
  const statusLabel =
    order.status === 'DELIVERED'
      ? 'Livrée'
      : deliveryStatus
        ? (DELIVERY_STATUS_LABELS[deliveryStatus] ?? 'En cours')
        : order.status === 'PREPARING'
          ? 'En préparation'
          : order.status === 'CONFIRMED' || order.status === 'PENDING'
            ? 'Bientôt en route'
            : 'En livraison';
  const showLiveMap =
    trackable && !!originCoords && !!destinationCoords && (!!driverCoords || order.status !== 'PENDING');
  const fullMapHeight = Dimensions.get('window').height - insets.top - insets.bottom - 48;

  if (isConfirmation) {
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.lg }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.card, shadows.md]}>
            <LinearGradient
              colors={[colors.success, '#15803d']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.confirmationGradient}
            >
              <Ionicons name="checkmark-circle" size={48} color="#fff" style={styles.confirmationIcon} />
              <Text style={styles.confirmationTitle}>Commande confirmée</Text>
              <Text style={styles.confirmationSubtitle}>
                Commande #{order.id.slice(0, 8).toUpperCase()}
              </Text>
              <Text style={styles.confirmationHint}>
                Suivez votre commande depuis Profil → Mes commandes.
              </Text>
            </LinearGradient>
          </View>

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
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatPrice(order.grandTotal)}</Text>
              </View>
            </View>
          </View>

          <Button title="Retour à l'accueil" onPress={goHome} style={styles.homeBtn} />

          {CANCELLABLE.includes(order.status) ? (
            <Button
              title="Annuler la commande"
              variant="danger"
              onPress={handleCancel}
              loading={cancelling}
              style={styles.cancelBtn}
            />
          ) : null}
          {cancelError ? <Text style={styles.errorText}>{cancelError}</Text> : null}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { paddingTop: insets.top + 56 }]} showsVerticalScrollIndicator={false}>
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
              <Text style={styles.headerOrderId}>Commande #{order.id.slice(0, 8)}</Text>
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

        {/* ── Live Map ── */}
        {showLiveMap && (
          <View style={[styles.card, { padding: spacing.md }]}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconWrap}>
                <Ionicons name="navigate" size={16} color={colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Position du livreur</Text>
            </View>
            <DriverLiveMap
              origin={originCoords}
              destination={destinationCoords}
              driverPosition={driverCoords}
              progress={mapProgress}
              driverName={order.delivery?.driver?.firstName ? `${order.delivery.driver.firstName} ${order.delivery.driver.lastName ?? ''}` : 'Livreur'}
              statusLabel={statusLabel}
              etaMinutes={etaMinutes}
              onExpand={() => setMapExpanded(true)}
            />
          </View>
        )}

        {trackingEvents.length > 0 ? (
          <View style={[styles.card, shadows.md]}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconWrap}>
                <Ionicons name="list" size={16} color={colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Historique livraison</Text>
            </View>
            <View style={styles.trackingEvents}>
              {[...trackingEvents].reverse().map((event, index) => (
                <View key={event.id} style={styles.eventRow}>
                  <View style={styles.eventIndicatorCol}>
                    <View style={[styles.eventDot, index === 0 && styles.eventDotCurrent]} />
                    {index < trackingEvents.length - 1 ? <View style={styles.eventLine} /> : null}
                  </View>
                  <View style={styles.eventBody}>
                    <Text style={[styles.eventMessage, index === 0 && styles.eventMessageCurrent]}>
                      {event.message ?? DELIVERY_STATUS_LABELS[event.status] ?? event.status}
                    </Text>
                    <Text style={styles.eventTime}>{formatDateTime(event.createdAt)}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : null}

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
                      <PhoneNumber phone={order.delivery.driver.phone} tint="#fff" size={13} />
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
      <FloatingBackButton navigation={navigation} />

      <Modal visible={mapExpanded} animationType="slide" onRequestClose={() => setMapExpanded(false)}>
        <View style={[styles.fullMapScreen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          {showLiveMap ? (
            <DriverLiveMap
              origin={originCoords}
              destination={destinationCoords}
              driverPosition={driverCoords}
              progress={mapProgress}
              driverName={order.delivery?.driver?.firstName ? `${order.delivery.driver.firstName} ${order.delivery.driver.lastName ?? ''}` : 'Livreur'}
              statusLabel={statusLabel}
              etaMinutes={etaMinutes}
              mapHeight={fullMapHeight}
            />
          ) : null}
          <TouchableOpacity
            style={[styles.closeMapBtn, { top: insets.top + 12 }]}
            onPress={() => setMapExpanded(false)}
            activeOpacity={0.85}
          >
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: 120 },

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
    flex: 1,
    fontSize: 16,
    fontFamily: fonts.titleBold,
    color: '#fff',
    textAlign: 'center',
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
    paddingTop: spacing.xl,
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
    fontSize: 14,
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
    fontSize: 20,
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
  homeBtn: {
    marginTop: spacing.sm,
    height: 52,
    borderRadius: radius.sm,
  },
  confirmationGradient: {
    borderRadius: radius.md,
    padding: spacing.xl,
    alignItems: 'center',
  },
  confirmationIcon: {
    marginBottom: spacing.sm,
  },
  confirmationTitle: {
    fontSize: 22,
    fontFamily: fonts.titleBold,
    color: '#fff',
    textAlign: 'center',
  },
  confirmationSubtitle: {
    fontSize: 14,
    fontFamily: fonts.bodyMedium,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 6,
  },
  confirmationHint: {
    fontSize: 13,
    fontFamily: fonts.bodyMedium,
    color: 'rgba(255,255,255,0.75)',
    marginTop: spacing.md,
    textAlign: 'center',
    lineHeight: 19,
  },
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

  trackingEvents: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  eventIndicatorCol: {
    width: 20,
    alignItems: 'center',
  },
  eventDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
    marginTop: 4,
  },
  eventDotCurrent: {
    backgroundColor: colors.primary,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  eventLine: {
    width: 2,
    flex: 1,
    minHeight: 28,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  eventBody: {
    flex: 1,
    marginLeft: spacing.sm,
    paddingBottom: spacing.md,
  },
  eventMessage: {
    fontSize: 13,
    fontFamily: fonts.bodyMedium,
    color: colors.textMuted,
  },
  eventMessageCurrent: {
    color: colors.secondary,
    fontFamily: fonts.bodyBold,
  },
  eventTime: {
    fontSize: 11,
    fontFamily: fonts.bodyMedium,
    color: colors.textMuted,
    marginTop: 3,
  },

  fullMapScreen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  closeMapBtn: {
    position: 'absolute',
    right: spacing.lg,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
});
