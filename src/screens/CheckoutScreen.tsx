import React, { useState, useRef, useEffect } from 'react';
import {
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useCreateOrderMutation } from '../graphql/operations';
import type { PaymentMethod } from '../graphql/types';
import { assetUrl } from '../lib/api';
import { useCart } from '../lib/cart';
import { MOCK_MODE } from '../config/mock';
import { createMockOrder } from '../mocks/service';
import { colors, radius, spacing, fonts, shadows } from '../theme';
import { EmptyState, formatPrice } from '../components/ui';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

const STEPS = [
  { label: 'Panier', icon: 'cart' as const },
  { label: 'Adresse', icon: 'location' as const },
  { label: 'Paiement', icon: 'card' as const },
];

function Stepper({ activeStep }: { activeStep: number }) {
  const anims = useRef(STEPS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    STEPS.forEach((_, i) => {
      Animated.timing(anims[i], {
        toValue: i <= activeStep ? 1 : 0,
        duration: 400,
        delay: i * 120,
        useNativeDriver: false,
      }).start();
    });
  }, [activeStep]);

  return (
    <View style={s.stepperRow}>
      {STEPS.map((step, i) => {
        const isActive = i === activeStep;
        const isCompleted = i < activeStep;
        const scale = anims[i].interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] });
        const bgColor = anims[i].interpolate({
          inputRange: [0, 1],
          outputRange: [colors.surface, isCompleted ? colors.success : colors.primary],
        });
        return (
          <React.Fragment key={i}>
            {i > 0 && (
              <View style={s.stepLine}>
                <Animated.View
                  style={[
                    s.stepLineFill,
                    {
                      width: anims[i].interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              </View>
            )}
            <Animated.View style={{ transform: [{ scale }], alignItems: 'center' }}>
              <Animated.View
                style={[
                  s.stepCircle,
                  {
                    backgroundColor: bgColor,
                    borderColor: isActive || isCompleted ? 'transparent' : colors.border,
                  },
                ]}
              >
                {isCompleted ? (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                ) : (
                  <Ionicons
                    name={step.icon}
                    size={14}
                    color={isActive ? '#fff' : colors.textMuted}
                  />
                )}
              </Animated.View>
              <Text
                style={[
                  s.stepLabel,
                  (isActive || isCompleted) && { color: colors.secondary, fontFamily: fonts.bodyBold },
                ]}
              >
                {step.label}
              </Text>
            </Animated.View>
          </React.Fragment>
        );
      })}
    </View>
  );
}

function ShimmerButton({
  title,
  onPress,
  loading,
}: {
  title: string;
  onPress: () => void;
  loading: boolean;
}) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1800,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 400],
  });

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} disabled={loading}>
      <View style={[s.submitOuter, shadows.glow(colors.primary)]}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.submitGradient}
        >
          <Animated.View
            style={[
              s.shimmerBar,
              { transform: [{ translateX }] },
            ]}
          />
          {loading ? (
            <View style={s.submitLoading}>
              <Animated.View
                style={{
                  transform: [
                    {
                      rotate: shimmer.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      }),
                    },
                  ],
                }}
              >
                <Ionicons name="sync" size={20} color="#fff" />
              </Animated.View>
              <Text style={s.submitText}>Traitement…</Text>
            </View>
          ) : (
            <Text style={s.submitText}>{title}</Text>
          )}
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
}

function AnimatedPrice({ value }: { value: number }) {
  const scale = useRef(new Animated.Value(1)).current;
  const prevVal = useRef(value);

  useEffect(() => {
    if (prevVal.current !== value) {
      prevVal.current = value;
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.15, duration: 150, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [value]);

  return (
    <Animated.Text style={[s.summaryTotalValue, { transform: [{ scale }] }]}>
      {formatPrice(value)}
    </Animated.Text>
  );
}

export default function CheckoutScreen({ navigation }: Props) {
  const { cart, subtotal, total, clear } = useCart();
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [createOrder, { loading }] = useCreateOrderMutation();

  const addressFocus = useRef(new Animated.Value(0)).current;
  const zipFocus = useRef(new Animated.Value(0)).current;
  const cityFocus = useRef(new Animated.Value(0)).current;
  const notesFocus = useRef(new Animated.Value(0)).current;

  const animateInput = (anim: Animated.Value, toValue: number) => {
    Animated.timing(anim, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const makeBorderInterpolate = (anim: Animated.Value) =>
    anim.interpolate({
      inputRange: [0, 1],
      outputRange: [colors.border, colors.primary],
    });

  const activeStep =
    address.trim() && city.trim() && zipCode.trim() ? 2 : 0;

  const handleSubmit = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setError(null);
    if (!cart.restaurantId || cart.lines.length === 0) {
      setError('Votre panier est vide.');
      return;
    }
    if (!address.trim() || !city.trim() || !zipCode.trim()) {
      setError('Veuillez renseigner l\u2019adresse de livraison complète.');
      return;
    }
    try {
      if (MOCK_MODE) {
        const createdOrder = await createMockOrder({
          restaurantId: cart.restaurantId,
          items: cart.lines.map((l) => ({ menuItemId: l.menuItem.id, quantity: l.quantity })),
          deliveryAddress: address.trim(),
          deliveryCity: city.trim(),
          deliveryZipCode: zipCode.trim(),
          paymentMethod: 'CASH_ON_DELIVERY' as PaymentMethod,
        });
        clear();
        navigation.navigate('OrderDetail', { id: createdOrder.id });
        return;
      }
      const { data } = await createOrder({
        variables: {
          input: {
            restaurantId: cart.restaurantId,
            items: cart.lines.map((l) => ({ menuItemId: l.menuItem.id, quantity: l.quantity })),
            deliveryAddress: address.trim(),
            deliveryCity: city.trim(),
            deliveryZipCode: zipCode.trim(),
            paymentMethod: 'CASH_ON_DELIVERY' as PaymentMethod,
          },
        },
      });
      if (!data?.createOrder) throw new Error('Réponse invalide du serveur.');
      clear();
      navigation.navigate('OrderDetail', { id: data.createOrder.id });
    } catch (e) {
      const message =
        e instanceof Error && e.message.toLowerCase().includes('restaurant')
          ? 'Ce restaurant n\u2019est plus disponible.'
          : 'Impossible de créer la commande. Vérifiez votre connexion et réessayez.';
      setError(message);
    }
  };

  if (!cart.restaurantId || cart.lines.length === 0) {
    return (
      <View style={s.emptyContainer}>
        <EmptyState title="Votre panier est vide" subtitle="Ajoutez des plats depuis un restaurant." />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={s.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={s.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Stepper */}
        <Stepper activeStep={activeStep} />

        {/* Restaurant header */}
        <View style={s.restaurantHeader}>
          <View style={s.restaurantIconWrap}>
            <Ionicons name="restaurant" size={18} color={colors.primary} />
          </View>
          <Text style={s.restaurantName}>{cart.restaurantName}</Text>
        </View>

        {/* Items Card */}
        <View style={[s.card, shadows.md]}>
          <View style={s.cardHeader}>
            <Ionicons name="receipt" size={18} color={colors.primary} />
            <Text style={s.cardTitle}>Articles</Text>
            <View style={s.badge}>
              <Text style={s.badgeText}>{cart.lines.length}</Text>
            </View>
          </View>

          {cart.lines.map((line) => (
            <View key={line.menuItem.id} style={s.line}>
              <View style={s.lineImageWrap}>
                {line.menuItem.imageUrl ? (
                  <Image source={{ uri: assetUrl(line.menuItem.imageUrl) }} style={s.lineImage} />
                ) : (
                  <View style={s.lineImagePlaceholder}>
                    <Ionicons name="fast-food" size={18} color={colors.primary} />
                  </View>
                )}
                <View style={s.qtyBadge}>
                  <Text style={s.qtyBadgeText}>{line.quantity}</Text>
                </View>
              </View>
              <View style={s.lineBody}>
                <Text style={s.lineName} numberOfLines={1}>
                  {line.menuItem.name}
                </Text>
                <Text style={s.lineSubtext}>
                  {formatPrice(line.menuItem.price)} × {line.quantity}
                </Text>
              </View>
              <Text style={s.linePrice}>{formatPrice(line.quantity * line.menuItem.price)}</Text>
            </View>
          ))}

          {/* Price Summary */}
          <View style={s.summary}>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Sous-total</Text>
              <Text style={s.summaryValue}>{formatPrice(subtotal)}</Text>
            </View>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Frais de livraison</Text>
              {cart.deliveryFee === 0 ? (
                <View style={s.freeBadge}>
                  <Text style={s.freeText}>Gratuit</Text>
                </View>
              ) : (
                <Text style={s.summaryValue}>{formatPrice(cart.deliveryFee)}</Text>
              )}
            </View>
            <View style={s.summaryDivider} />
            <View style={s.summaryRow}>
              <Text style={s.summaryTotalLabel}>Total</Text>
              <AnimatedPrice value={total} />
            </View>
          </View>
        </View>

        {/* Address Card */}
        <View style={[s.card, shadows.md]}>
          <View style={s.cardHeader}>
            <Ionicons name="location" size={18} color={colors.primary} />
            <Text style={s.cardTitle}>Adresse de livraison</Text>
          </View>

          <View style={s.inputGroup}>
            <View style={s.inputLabel}>
              <Ionicons name="home-outline" size={14} color={colors.textMuted} />
              <Text style={s.label}>Adresse</Text>
            </View>
            <Animated.View style={[s.inputWrapper, { borderColor: makeBorderInterpolate(addressFocus) }]}>
              <Ionicons name="navigate-outline" size={16} color={colors.textMuted} style={s.inputIcon} />
              <TextInput
                style={s.input}
                value={address}
                onChangeText={setAddress}
                placeholder="12 rue des Lilas"
                placeholderTextColor={colors.textMuted}
                onFocus={() => animateInput(addressFocus, 1)}
                onBlur={() => animateInput(addressFocus, 0)}
              />
            </Animated.View>
          </View>

          <View style={s.row}>
            <View style={s.rowItem}>
              <View style={s.inputLabel}>
                <Ionicons name="mail-outline" size={14} color={colors.textMuted} />
                <Text style={s.label}>Code postal</Text>
              </View>
              <Animated.View style={[s.inputWrapper, { borderColor: makeBorderInterpolate(zipFocus) }]}>
                <Ionicons name="keypad-outline" size={16} color={colors.textMuted} style={s.inputIcon} />
                <TextInput
                  style={s.input}
                  value={zipCode}
                  onChangeText={setZipCode}
                  placeholder="75011"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  onFocus={() => animateInput(zipFocus, 1)}
                  onBlur={() => animateInput(zipFocus, 0)}
                />
              </Animated.View>
            </View>
            <View style={[s.rowItem, s.rowItemWide]}>
              <View style={s.inputLabel}>
                <Ionicons name="business-outline" size={14} color={colors.textMuted} />
                <Text style={s.label}>Ville</Text>
              </View>
              <Animated.View style={[s.inputWrapper, { borderColor: makeBorderInterpolate(cityFocus) }]}>
                <Ionicons name="location-outline" size={16} color={colors.textMuted} style={s.inputIcon} />
                <TextInput
                  style={s.input}
                  value={city}
                  onChangeText={setCity}
                  placeholder="Paris"
                  placeholderTextColor={colors.textMuted}
                  onFocus={() => animateInput(cityFocus, 1)}
                  onBlur={() => animateInput(cityFocus, 0)}
                />
              </Animated.View>
            </View>
          </View>

          <View style={s.inputGroup}>
            <View style={s.inputLabel}>
              <Ionicons name="chatbubble-outline" size={14} color={colors.textMuted} />
              <Text style={s.label}>Notes facultatives</Text>
            </View>
            <Animated.View style={[s.inputWrapper, { borderColor: makeBorderInterpolate(notesFocus) }]}>
              <Ionicons name="document-text-outline" size={16} color={colors.textMuted} style={[s.inputIcon, { marginTop: 12 }]} />
              <TextInput
                style={[s.input, s.inputMultiline]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Code d'accès, étage, instructions…"
                placeholderTextColor={colors.textMuted}
                multiline
                onFocus={() => animateInput(notesFocus, 1)}
                onBlur={() => animateInput(notesFocus, 0)}
              />
            </Animated.View>
          </View>
        </View>

        {/* Payment Card */}
        <View style={[s.card, shadows.md]}>
          <View style={s.cardHeader}>
            <Ionicons name="wallet" size={18} color={colors.primary} />
            <Text style={s.cardTitle}>Mode de paiement</Text>
          </View>
          <View style={s.paymentRow}>
            <View style={s.paymentIconWrap}>
              <Ionicons name="cash" size={20} color={colors.success} />
            </View>
            <View>
              <Text style={s.paymentTitle}>Espèces à la livraison</Text>
              <Text style={s.paymentSub}>Payez directement au livreur</Text>
            </View>
          </View>
        </View>

        {/* Error */}
        {error ? (
          <View style={s.errorCard}>
            <View style={s.errorIconWrap}>
              <Ionicons name="alert-circle" size={20} color={colors.danger} />
            </View>
            <Text style={s.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Submit */}
        <ShimmerButton
          title={`Valider la commande · ${formatPrice(total)}`}
          onPress={handleSubmit}
          loading={loading}
        />

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  emptyContainer: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  container: { padding: spacing.lg, paddingTop: spacing.md },

  // Stepper
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  stepCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
    fontFamily: fonts.bodyMedium,
  },
  stepLine: {
    flex: 1,
    height: 3,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginHorizontal: 4,
    marginBottom: 18,
    overflow: 'hidden',
  },
  stepLineFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 2,
  },

  // Restaurant header
  restaurantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  restaurantIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.secondary,
    fontFamily: fonts.titleBold,
    flex: 1,
  },

  // Card
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.secondary,
    fontFamily: fonts.titleSemiBold,
    flex: 1,
  },
  badge: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    fontFamily: fonts.bodyBold,
  },

  // Items
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  lineImageWrap: { position: 'relative' },
  lineImage: {
    width: 48,
    height: 48,
    borderRadius: radius.xs,
  },
  lineImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: radius.xs,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  qtyBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    fontFamily: fonts.bodyBold,
  },
  lineBody: { flex: 1 },
  lineName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondary,
    fontFamily: fonts.titleSemiBold,
  },
  lineSubtext: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    fontFamily: fonts.bodyMedium,
  },
  linePrice: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.secondary,
    fontFamily: fonts.bodyBold,
  },

  // Summary
  summary: {
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textMuted,
    fontFamily: fonts.bodyMedium,
  },
  summaryValue: {
    fontSize: 14,
    color: colors.secondary,
    fontWeight: '600',
    fontFamily: fonts.bodyBold,
  },
  freeBadge: {
    backgroundColor: '#ECFDF5',
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  freeText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.success,
    fontFamily: fonts.bodyBold,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.secondary,
    fontFamily: fonts.titleBold,
  },
  summaryTotalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    fontFamily: fonts.titleBold,
  },

  // Inputs
  inputGroup: { marginTop: spacing.sm },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.secondary,
    fontFamily: fonts.titleSemiBold,
  },
  inputWrapper: {
    borderWidth: 1.5,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  inputIcon: { marginLeft: spacing.sm },
  input: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 11,
    fontSize: 15,
    color: colors.text,
    fontFamily: fonts.bodyMedium,
  },
  inputMultiline: { minHeight: 70, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  rowItem: { flex: 1 },
  rowItemWide: { flex: 2 },

  // Payment
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#ECFDF5',
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  paymentIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.secondary,
    fontFamily: fonts.bodyBold,
  },
  paymentSub: {
    fontSize: 12,
    color: colors.textMuted,
    fontFamily: fonts.bodyMedium,
    marginTop: 1,
  },

  // Error
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#FEF2F2',
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: colors.danger,
    fontFamily: fonts.bodyBold,
  },

  // Submit
  submitOuter: {
    borderRadius: radius.sm,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  submitGradient: {
    height: 54,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  shimmerBar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 120,
    backgroundColor: 'rgba(255,255,255,0.15)',
    transform: [{ skewX: '-20deg' }],
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    fontFamily: fonts.titleBold,
    letterSpacing: 0.3,
  },
  submitLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
