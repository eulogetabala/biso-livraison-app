import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCreateOrderMutation, useRestaurantQuery } from '../graphql/operations';
import type { PaymentMethod } from '../graphql/types';
import { assetUrl } from '../lib/api';
import { useCart, lineUnitPrice } from '../lib/cart';
import { colors, radius, spacing, fonts, shadows } from '../theme';
import { EmptyState, formatPrice } from '../components/ui';
import FloatingBackButton from '../components/FloatingBackButton';
import AddressPickerModal from '../components/AddressPickerModal';
import PhoneInput from '../components/PhoneInput';
import { AppTextInput } from '../components/AppTextInput';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

type CheckoutStep = 'address' | 'payment';

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
  const insets = useSafeAreaInsets();
  const { cart, subtotal, clear } = useCart();
  const [step, setStep] = useState<CheckoutStep>('address');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [deliveryCoords, setDeliveryCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [createOrder, { loading }] = useCreateOrderMutation();
  const { data: restaurantData } = useRestaurantQuery({
    variables: { id: cart.restaurantId ?? '' },
    skip: !cart.restaurantId,
  });

  const deliveryFee = restaurantData?.restaurant?.deliveryFee ?? 0;

  const total = subtotal + deliveryFee;

  const activeStep = step === 'payment' ? 2 : 1;

  const digitsOnly = (v: string) => v.replace(/\D/g, '');

  const goToPayment = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setError(null);
    if (!address.trim()) {
      setError('Veuillez choisir ou saisir une adresse de livraison.');
      return;
    }
    if (digitsOnly(phone).length < 9) {
      setError('Veuillez renseigner un numéro de téléphone valide.');
      return;
    }
    setStep('payment');
  };

  const handleSubmit = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setError(null);
    if (!cart.restaurantId || cart.lines.length === 0) {
      setError('Votre panier est vide.');
      return;
    }
    if (!address.trim()) {
      setError('Veuillez renseigner l\u2019adresse de livraison.');
      return;
    }
    try {
      const { data } = await createOrder({
        variables: {
          input: {
            restaurantId: cart.restaurantId,
            items: cart.lines.map((l) => ({ menuItemId: l.menuItem.id, quantity: l.quantity })),
            deliveryAddress: address.trim(),
            deliveryCity: 'Brazzaville',
            deliveryZipCode: '0000',
            deliveryLatitude: deliveryCoords?.latitude,
            deliveryLongitude: deliveryCoords?.longitude,
            paymentMethod: 'CASH_ON_DELIVERY' as PaymentMethod,
          },
        },
      });
      if (!data?.createOrder) throw new Error('Réponse invalide du serveur.');
      clear();
      navigation.navigate('OrderDetail', { id: data.createOrder.id, confirmation: true });
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
      <FloatingBackButton navigation={navigation} />
      <ScrollView
        contentContainerStyle={[s.container, { paddingTop: insets.top + 52 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={s.pageTitle}>{step === 'payment' ? 'Paiement' : 'Adresse de livraison'}</Text>

        {/* Stepper */}
        <Stepper activeStep={activeStep} />

        {/* Restaurant header */}
        <View style={s.restaurantHeader}>
          <View style={s.restaurantIconWrap}>
            <Ionicons name="restaurant" size={18} color={colors.primary} />
          </View>
          <Text style={s.restaurantName}>{cart.restaurantName}</Text>
        </View>

        {/* Items Card (compact recap) */}
        <View style={[s.card, shadows.md]}>
          <View style={s.cardHeader}>
            <Ionicons name="receipt" size={18} color={colors.primary} />
            <Text style={s.cardTitle}>Articles</Text>
            <View style={s.badge}>
              <Text style={s.badgeText}>{cart.lines.length}</Text>
            </View>
          </View>

          {cart.lines.map((line) => (
            <View key={line.key} style={s.line}>
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
                {line.supplements.length > 0 ? (
                  <Text style={s.lineSupplements} numberOfLines={1}>
                    + {line.supplements.map((sup) => sup.name).join(', ')}
                  </Text>
                ) : null}
                <Text style={s.lineSubtext}>
                  {formatPrice(lineUnitPrice(line))} × {line.quantity}
                </Text>
              </View>
              <Text style={s.linePrice}>
                {formatPrice(lineUnitPrice(line) * line.quantity)}
              </Text>
            </View>
          ))}

          <View style={s.summary}>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Sous-total</Text>
              <Text style={s.summaryValue}>{formatPrice(subtotal)}</Text>
            </View>
            {step === 'payment' ? (
              <>
                <View style={s.summaryRow}>
                  <Text style={s.summaryLabel}>Frais de livraison</Text>
                  <Text style={s.summaryValue}>{formatPrice(deliveryFee)}</Text>
                </View>
                <View style={s.summaryDivider} />
                <View style={s.summaryRow}>
                  <Text style={s.summaryTotalLabel}>Total</Text>
                  <AnimatedPrice value={total} />
                </View>
              </>
            ) : null}
          </View>
        </View>

        {/* Address Card */}
        {step === 'address' ? (
          <View style={[s.card, shadows.md]}>
            <View style={s.cardHeader}>
              <Ionicons name="location" size={18} color={colors.primary} />
              <Text style={s.cardTitle}>Adresse de livraison</Text>
            </View>

            <Pressable
              style={s.addressRow}
              onPress={() => {
                setPickerOpen(true);
                setError(null);
              }}
            >
              <View style={[s.addressRowIcon, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="map-outline" size={18} color={colors.primary} />
              </View>
              <View style={s.addressRowBody}>
                <Text style={s.addressRowLabel}>Adresse de livraison</Text>
                <Text style={s.addressRowValue}>
                  {address || 'Trouver sur la carte ou saisir manuellement'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </Pressable>

            {/* Numéro de téléphone pour la livraison */}
            <View style={s.phoneGroup}>
              <View style={s.inputLabel}>
                <Ionicons name="call-outline" size={14} color={colors.textMuted} />
                <Text style={s.label}>Numéro de téléphone</Text>
              </View>
              <View style={s.phoneWrapper}>
                <PhoneInput
                  value={phone}
                  onChange={setPhone}
                  placeholder="06 XXX XX XX"
                />
              </View>
            </View>

            {/* Note pour le restaurant */}
            <View style={s.phoneGroup}>
              <View style={s.inputLabel}>
                <Ionicons name="chatbubble-ellipses-outline" size={14} color={colors.textMuted} />
                <Text style={s.label}>Note pour le restaurant (optionnel)</Text>
              </View>
              <AppTextInput
                style={s.noteInput}
                value={note}
                onChangeText={setNote}
                placeholder="Ex : sans piment, couverts en plus…"
                multiline
                maxLength={160}
                numberOfLines={3}
              />
            </View>
          </View>
        ) : (
          /* Payment Card */
          <View style={[s.card, shadows.md]}>
            <View style={s.cardHeader}>
              <Ionicons name="location" size={18} color={colors.primary} />
              <Text style={s.cardTitle}>Adresse de livraison</Text>
            </View>
            <View style={s.confirmRow}>
              <View style={[s.confirmRowIcon, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="home-outline" size={18} color={colors.primary} />
              </View>
              <Text style={s.confirmAddressText}>{address}</Text>
            </View>
            <View style={[s.confirmRow, s.confirmRowPhone]}>
              <View style={[s.confirmRowIcon, { backgroundColor: colors.secondaryLight }]}>
                <Ionicons name="call-outline" size={18} color={colors.secondary} />
              </View>
              <Text style={s.confirmAddressText}>+242 {phone}</Text>
            </View>
            {note.trim() ? (
              <View style={[s.confirmRow, s.confirmRowPhone, { marginTop: spacing.sm }]}>
                <View style={[s.confirmRowIcon, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.primary} />
                </View>
                <Text style={s.confirmAddressText}>{note.trim()}</Text>
              </View>
            ) : null}
            <Pressable style={s.editBtn} onPress={() => setStep('address')}>
              <Ionicons name="pencil" size={15} color={colors.primary} />
              <Text style={s.editText}>Modifier l'adresse</Text>
            </Pressable>
          </View>
        )}

        {/* Payment Method */}
        {step === 'payment' ? (
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
        ) : null}

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
        {step === 'address' ? (
          <ShimmerButton
            title="Continuer vers le paiement"
            onPress={goToPayment}
            loading={false}
          />
        ) : (
          <ShimmerButton
            title={`Valider la commande · ${formatPrice(total)}`}
            onPress={handleSubmit}
            loading={loading}
          />
        )}

        <View style={{ height: spacing.xl }} />
      </ScrollView>

      {/* Sélecteur d'adresse sur la carte */}
      <AddressPickerModal
        visible={pickerOpen}
        target="delivery"
        initialAddress={address}
        defaultCity="brazzaville"
        onClose={() => setPickerOpen(false)}
        onConfirm={(addr, coords) => {
          setAddress(addr);
          setDeliveryCoords(coords ?? null);
          setPickerOpen(false);
          setError(null);
        }}
      />
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  emptyContainer: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  container: { padding: spacing.lg, paddingTop: spacing.md, paddingBottom: 120 },

  pageTitle: {
    fontFamily: fonts.titleBold,
    fontSize: 22,
    color: colors.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },

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
    fontSize: 14,
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
  lineSupplements: {
    fontSize: 11,
    color: colors.primary,
    marginTop: 2,
    fontFamily: fonts.bodyMedium,
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
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    fontFamily: fonts.titleBold,
  },

  // Inputs
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
  phoneGroup: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
  },
  phoneWrapper: {
    borderWidth: 1.5,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    height: 52,
    justifyContent: 'center',
  },
  noteInput: {
    minHeight: 76,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    padding: spacing.sm,
    fontSize: 14,
    color: colors.text,
    fontFamily: fonts.bodyMedium,
    textAlignVertical: 'top',
  },

  // Adresse picker / saisie
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  addressRowIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressRowBody: { flex: 1 },
  addressRowLabel: {
    fontSize: 14,
    fontFamily: fonts.bodyBold,
    color: colors.secondary,
  },
  addressRowValue: {
    fontSize: 12,
    fontFamily: fonts.bodyMedium,
    color: colors.textMuted,
    marginTop: 1,
  },
  confirmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  confirmRowPhone: {
    marginBottom: 0,
  },
  confirmRowIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmAddressText: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.bodyMedium,
    color: colors.text,
    lineHeight: 20,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },
  editText: {
    fontSize: 13,
    fontFamily: fonts.bodyBold,
    color: colors.primary,
  },

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
    fontSize: 15,
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
