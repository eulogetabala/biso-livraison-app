import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
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
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing, fonts, shadows } from '../theme';
import FloatingBackButton from '../components/FloatingBackButton';
import PhoneInput from '../components/PhoneInput';
import { AppTextInput } from '../components/AppTextInput';
import AddressPickerModal from '../components/AddressPickerModal';
import { useCreateParcelMutation } from '../graphql/operations';
import { useAuth } from '../lib/auth';
import { getGraphqlErrorMessage, isUnauthorizedError } from '../lib/graphql-errors';
import { getStoredToken } from '../lib/token-storage';
import { requestLocationPermission, promptLocationDenied } from '../lib/permissions';
import { TAB_BAR_OFFSET } from '../components/AppTabBar';

function formatCongoPhone(raw: string): string {
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('242')) digits = digits.slice(3);
  return `+242${digits}`;
}

type Props = NativeStackScreenProps<RootStackParamList, 'Parcel'>;

type Destination = 'local' | 'intercity';

type Step = 1 | 2 | 3 | 4;

const PARCEL_TYPES = [
  { label: 'Documents', icon: 'document-text-outline' as const },
  { label: 'Livres', icon: 'book-outline' as const },
  { label: 'Téléphone', icon: 'phone-portrait-outline' as const },
  { label: 'Vêtements', icon: 'shirt-outline' as const },
  { label: 'Nourriture', icon: 'fast-food-outline' as const },
  { label: 'Électronique', icon: 'hardware-chip-outline' as const },
  { label: 'Médicaments', icon: 'medkit-outline' as const },
  { label: 'Autre', icon: 'ellipsis-horizontal-circle-outline' as const },
];

const WEIGHTS = [
  { key: 'petit', label: '< 1 kg', hint: 'Enveloppes, docs', icon: 'cube-outline' as const },
  { key: 'moyen', label: '1–5 kg', hint: 'Livres, habits', icon: 'cube-outline' as const },
  { key: 'grand', label: '5–10 kg', hint: 'Cartons, élec.', icon: 'cube-outline' as const },
];

const STEP_LABELS: Record<Step, string> = {
  1: 'Destination',
  2: 'Adresse',
  3: 'Colis',
  4: 'Destinataire',
};

export default function ParcelScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [destination, setDestination] = useState<Destination | null>(null);
  const [myPosition, setMyPosition] = useState<string>('Brazzaville');
  const [locating, setLocating] = useState(false);

  // Étape 2 – adresse
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [pickerTarget, setPickerTarget] = useState<'pickup' | 'dropoff' | null>(null);
  const [pickerInitialMode, setPickerInitialMode] = useState<'map' | 'manual'>('map');
  const [pickupCoords, setPickupCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  // Étape 3 – colis
  const [parcelType, setParcelType] = useState<string | null>(null);
  const [customType, setCustomType] = useState('');
  const [weight, setWeight] = useState<string | null>('petit');

  // Étape 4 – destinataire
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdParcelId, setCreatedParcelId] = useState<string | null>(null);
  const [createParcel, { loading: creatingParcel }] = useCreateParcelMutation();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    transition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const transition = () => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const goNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep((s) => (s < 4 ? ((s + 1) as Step) : s));
    transition();
  };

  const goBack = () => {
    Haptics.selectionAsync();
    setStep((s) => (s > 1 ? ((s - 1) as Step) : s));
    transition();
  };

  const locateAddress = async (target: 'pickup' | 'dropoff') => {
    setLocating(true);
    const permission = await requestLocationPermission();
    if (permission !== 'granted') {
      const fallback = 'Moungali, Brazzaville';
      setMyPosition(fallback);
      if (target === 'pickup') setPickupAddress(fallback);
      else setDropoffAddress(fallback);
      setLocating(false);
      promptLocationDenied(permission, () => locateAddress(target));
      return;
    }
    try {
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const places = await Location.reverseGeocodeAsync(position.coords);
      const place = places[0];
      const district = place?.district || place?.subregion || place?.city || 'Brazzaville';
      const city = place?.city && place.city !== district ? `, ${place.city}` : ', Brazzaville';
      const address = `${district}${city}`;
      setMyPosition(address);
      if (target === 'pickup') setPickupAddress(address);
      else setDropoffAddress(address);
    } catch {
      setMyPosition('Brazzaville');
      if (target === 'pickup') setPickupAddress('Brazzaville');
      else setDropoffAddress('Brazzaville');
    } finally {
      setLocating(false);
    }
  };

  const price = useMemo(() => {
    if (!destination || !weight) return 0;
    const base = destination === 'local' ? 1000 : 2000;
    const weightExtra = weight === 'moyen' ? 500 : weight === 'grand' ? 1500 : 0;
    const express = destination === 'intercity' ? 0 : 0;
    return base + weightExtra + express;
  }, [destination, weight]);

  const canContinue = (() => {
    switch (step) {
      case 1:
        return destination != null;
      case 2:
        return pickupAddress.trim().length > 0 && dropoffAddress.trim().length > 0;
      case 3:
        return parcelType != null && (parcelType !== 'Autre' || customType.trim().length > 0);
      case 4:
        return (
          receiverName.trim().length >= 2 &&
          receiverPhone.replace(/\D/g, '').length >= 9
        );
      default:
        return false;
    }
  })();

  const handleConfirm = async () => {
    if (!canContinue || creatingParcel) return;
    Keyboard.dismiss();
    setSubmitError(null);

    const token = await getStoredToken();
    if (!user || !token) {
      setSubmitError('Connectez-vous pour expédier un colis.');
      navigation.navigate('Login');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const parcelTypeLabel = parcelType === 'Autre' ? customType.trim() : parcelType;
      const weightLabel = WEIGHTS.find((w) => w.key === weight)?.label ?? '1 kg';
      const description = [
        parcelTypeLabel,
        weightLabel,
        destination === 'intercity' ? 'Interville Brazzaville → Pointe-Noire' : 'Brazzaville',
        note.trim() ? `Note: ${note.trim()}` : null,
        pickupAddress.trim() ? `Ramassage: ${pickupAddress.trim()}` : null,
      ]
        .filter(Boolean)
        .join(' | ');

      const { data } = await createParcel({
        variables: {
          input: {
            receiverName: receiverName.trim(),
            receiverPhone: formatCongoPhone(receiverPhone),
            receiverAddress: dropoffAddress.trim(),
            description,
            weight: weight === 'petit' ? 1 : weight === 'moyen' ? 3 : 8,
          },
        },
      });
      setCreatedParcelId(data?.createParcel.id ?? null);
      setSubmitted(true);
    } catch (e) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      if (isUnauthorizedError(e)) {
        setSubmitError('Session expirée. Reconnectez-vous pour continuer.');
        await logout();
        navigation.navigate('Login');
        return;
      }
      const raw = getGraphqlErrorMessage(e, '');
      const lower = raw.toLowerCase();
      const message =
        lower.includes('phone') || lower.includes('receiverphone')
          ? 'Numéro de téléphone du destinataire invalide.'
          : lower.includes('serveur') || lower.includes('network') || lower.includes('fetch')
            ? 'Impossible de joindre le serveur. Vérifiez votre connexion.'
            : raw || 'Impossible d\'envoyer la demande. Réessayez.';
      setSubmitError(message);
    }
  };

  const openAddressPicker = (target: 'pickup' | 'dropoff', mode: 'map' | 'manual' = 'map') => {
    Haptics.selectionAsync();
    setPickerInitialMode(mode);
    setPickerTarget(target);
  };

  const handleBackHome = () => {
    navigation.navigate('Main', { screen: 'Home' });
  };

  if (submitted) {
    return (
      <SuccessView
        destination={destination ?? 'local'}
        pickupAddress={pickupAddress}
        dropoffAddress={dropoffAddress}
        parcelType={parcelType === 'Autre' ? customType : parcelType}
        weight={WEIGHTS.find((w) => w.key === weight)?.label}
        receiverName={receiverName}
        price={price}
        onBackHome={handleBackHome}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 8 : 0}
    >
      <FloatingBackButton navigation={navigation} />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <LinearGradient colors={['#081A4B', colors.secondary, '#18336E']} style={[styles.hero, { paddingTop: insets.top + 16 }]}>
          <Text style={styles.heroTitle}>Expédition colis</Text>

          {/* Stepper */}
          <View style={styles.stepperRow}>
            {([1, 2, 3, 4] as Step[]).map((s) => {
              const active = s === step;
              const done = s < step;
              return (
                <React.Fragment key={s}>
                  {s > 1 && <View style={[styles.stepLine, (done || active) && styles.stepLineActive]} />}
                  <View style={[styles.stepDot, active && styles.stepDotActive, done && styles.stepDotDone]}>
                    {done ? (
                      <Ionicons name="checkmark" size={12} color="#fff" />
                    ) : (
                      <Text style={[styles.stepDotText, active && styles.stepDotTextActive]}>{s}</Text>
                    )}
                  </View>
                </React.Fragment>
              );
            })}
          </View>
          <Text style={styles.stepLabel}>
            Étape {step} — {STEP_LABELS[step]}
          </Text>
        </LinearGradient>

        <Animated.View style={[styles.stepBody, { opacity: fadeAnim }]}>
          {!user ? (
            <Pressable style={styles.authBanner} onPress={() => navigation.navigate('Login')}>
              <Ionicons name="log-in-outline" size={18} color={colors.primary} />
              <Text style={styles.authBannerText}>
                Connectez-vous pour expédier un colis
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.primary} />
            </Pressable>
          ) : null}

          {step === 1 ? (
            <DestinationStep
              destination={destination}
              myPosition={myPosition}
              locating={locating}
              onLocate={() => locateAddress('pickup')}
              onSelect={(d) => {
                Haptics.selectionAsync();
                setDestination(d);
                if (d === 'local') setDropoffAddress('');
              }}
            />
          ) : null}

          {step === 2 ? (
            <AddressStep
              pickupAddress={pickupAddress}
              dropoffAddress={dropoffAddress}
              onOpenPickup={(mode) => openAddressPicker('pickup', mode)}
              onOpenDropoff={(mode) => openAddressPicker('dropoff', mode)}
            />
          ) : null}

          {step === 3 ? (
            <ParcelStep
              parcelType={parcelType}
              customType={customType}
              weight={weight}
              onSelectType={(t) => {
                Haptics.selectionAsync();
                setParcelType(t);
              }}
              onCustomType={setCustomType}
              onSelectWeight={(w) => {
                Haptics.selectionAsync();
                setWeight(w);
              }}
            />
          ) : null}

          {step === 4 ? (
            <>
              <ReceiverStep
                receiverName={receiverName}
                receiverPhone={receiverPhone}
                note={note}
                onName={setReceiverName}
                onPhone={setReceiverPhone}
                onNote={setNote}
                price={price}
                destination={destination ?? 'local'}
              />

              {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}

              <View style={styles.step4Actions}>
                <Pressable style={styles.backBtnInline} onPress={goBack}>
                  <Ionicons name="arrow-back" size={20} color={colors.secondary} />
                </Pressable>
                <TouchableOpacity
                  style={[styles.nextBtnWrap, (!canContinue || creatingParcel) && styles.nextBtnDisabled]}
                  disabled={!canContinue || creatingParcel}
                  activeOpacity={0.85}
                  onPress={handleConfirm}
                >
                  <LinearGradient
                    colors={[colors.primary, colors.primaryDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.nextBtn}
                  >
                    <Ionicons name="paper-plane-outline" size={17} color="#fff" />
                    <Text style={styles.nextText}>
                      {creatingParcel ? 'Envoi…' : `Expédier · ${price.toLocaleString('fr-FR')} FCFA`}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </>
          ) : null}
        </Animated.View>
      </ScrollView>

      {/* Bottom bar — étapes 1 à 3 uniquement */}
      {step < 4 ? (
        <View style={[styles.bottomBar, styles.bottomBarWithTabs]}>
          {step > 1 ? (
            <Pressable style={styles.backBtn} onPress={goBack}>
              <Ionicons name="arrow-back" size={20} color={colors.secondary} />
            </Pressable>
          ) : (
            <View style={styles.backBtn} />
          )}
          <Pressable
            style={[styles.nextBtnWrap, !canContinue && styles.nextBtnDisabled]}
            disabled={!canContinue}
            onPress={goNext}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.nextBtn}
            >
              <Text style={styles.nextText}>Continuer</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </LinearGradient>
          </Pressable>
        </View>
      ) : null}

      {/* Sélecteur d'adresse sur la carte */}
      <AddressPickerModal
        visible={pickerTarget != null}
        target={pickerTarget ?? 'pickup'}
        initialMode={pickerInitialMode}
        initialAddress={pickerTarget === 'pickup' ? pickupAddress : dropoffAddress}
        defaultCity={
          destination === 'intercity' && pickerTarget === 'dropoff'
            ? 'pointe-noire'
            : 'brazzaville'
        }
        onClose={() => setPickerTarget(null)}
        onConfirm={(address, coords) => {
          if (pickerTarget === 'pickup') {
            setPickupAddress(address);
            setPickupCoords(coords ?? null);
          } else {
            setDropoffAddress(address);
            setDropoffCoords(coords ?? null);
          }
          setPickerTarget(null);
        }}
      />
    </KeyboardAvoidingView>
  );
}

/* ─────────────────────────── Steps ─────────────────────────── */

function DestinationStep({
  destination,
  myPosition,
  locating,
  onLocate,
  onSelect,
}: {
  destination: Destination | null;
  myPosition: string;
  locating: boolean;
  onLocate: () => void;
  onSelect: (d: Destination) => void;
}) {
  return (
    <View>
      {/* Position */}
      <Pressable style={styles.positionCard} onPress={onLocate} disabled={locating}>
        <View style={styles.positionIcon}>
          <Ionicons name={locating ? 'sync' : 'locate'} size={18} color={colors.primary} />
        </View>
        <View style={styles.positionBody}>
          <Text style={styles.positionLabel}>{locating ? 'Localisation…' : 'Ma position'}</Text>
          <Text style={styles.positionValue}>{myPosition}</Text>
        </View>
        <Ionicons name="refresh" size={16} color={colors.textMuted} />
      </Pressable>

      <Text style={styles.sectionTitle}>Où va ton colis ?</Text>

      <Pressable
        style={[styles.destCard, destination === 'local' && styles.destCardActive]}
        onPress={() => onSelect('local')}
      >
        <View style={[styles.destIcon, { backgroundColor: colors.primaryLight }]}>
          <Ionicons name="bicycle" size={22} color={colors.primary} />
        </View>
        <View style={styles.destBody}>
          <Text style={styles.destTitle}>Dans Brazzaville</Text>
          <Text style={styles.destSub}>Livraison express locale, dès 1 000 FCFA</Text>
        </View>
        <View style={[styles.radioOuter, destination === 'local' && styles.radioOuterActive]}>
          {destination === 'local' ? <View style={styles.radioInner} /> : null}
        </View>
      </Pressable>

      <Pressable
        style={[styles.destCard, destination === 'intercity' && styles.destCardActive]}
        onPress={() => onSelect('intercity')}
      >
        <View style={[styles.destIcon, { backgroundColor: '#EEF2FF' }]}>
          <Ionicons name="swap-horizontal" size={22} color="#4F46E5" />
        </View>
        <View style={styles.destBody}>
          <Text style={styles.destTitle}>Vers Pointe-Noire</Text>
          <Text style={styles.destSub}>Expédition interville, dès 2 000 FCFA</Text>
        </View>
        <View style={[styles.radioOuter, destination === 'intercity' && styles.radioOuterActive]}>
          {destination === 'intercity' ? <View style={styles.radioInner} /> : null}
        </View>
      </Pressable>

      <View style={styles.infoBanner}>
        <Ionicons name="information-circle" size={16} color={colors.info} />
        <Text style={styles.infoText}>
          Un coursier prendra en charge ton colis puis le livrera avec suivi en temps réel.
        </Text>
      </View>
    </View>
  );
}

function AddressStep({
  pickupAddress,
  dropoffAddress,
  onOpenPickup,
  onOpenDropoff,
}: {
  pickupAddress: string;
  dropoffAddress: string;
  onOpenPickup: (mode: 'map' | 'manual') => void;
  onOpenDropoff: (mode: 'map' | 'manual') => void;
}) {
  return (
    <View>
      <View style={styles.addressHeader}>
        <View style={styles.addressHeaderIcon}>
          <Ionicons name="storefront-outline" size={16} color={colors.primary} />
        </View>
        <Text style={styles.addressTitle}>Adresse de départ</Text>
      </View>

      <Pressable style={styles.addressRow} onPress={() => onOpenPickup('map')}>
        <View style={[styles.addressRowIcon, { backgroundColor: colors.primaryLight }]}>
          <Ionicons name="map-outline" size={18} color={colors.primary} />
        </View>
        <View style={styles.addressRowBody}>
          <Text style={styles.addressRowLabel}>Ajouter l'adresse de départ</Text>
          <Text style={styles.addressRowValue}>
            {pickupAddress || 'Choisir sur la carte ou saisir manuellement'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      </Pressable>

      <View style={[styles.addressHeader, styles.addressHeaderGap]}>
        <View style={[styles.addressHeaderIcon, { backgroundColor: colors.secondaryLight }]}>
          <Ionicons name="flag-outline" size={16} color={colors.secondary} />
        </View>
        <Text style={styles.addressTitle}>Adresse du destinataire</Text>
      </View>

      <Pressable style={styles.addressRow} onPress={() => onOpenDropoff('map')}>
        <View style={[styles.addressRowIcon, { backgroundColor: colors.secondaryLight }]}>
          <Ionicons name="map-outline" size={18} color={colors.secondary} />
        </View>
        <View style={styles.addressRowBody}>
          <Text style={styles.addressRowLabel}>Ajouter l'adresse de livraison</Text>
          <Text style={styles.addressRowValue}>
            {dropoffAddress || 'Choisir sur la carte ou saisir manuellement'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      </Pressable>

      <View style={styles.infoBanner}>
        <Ionicons name="information-circle" size={16} color={colors.info} />
        <Text style={styles.infoText}>
          Dans le sélecteur, basculez entre la carte et la saisie manuelle comme pour une commande restaurant.
        </Text>
      </View>
    </View>
  );
}

function ParcelStep({
  parcelType,
  customType,
  weight,
  onSelectType,
  onCustomType,
  onSelectWeight,
}: {
  parcelType: string | null;
  customType: string;
  weight: string | null;
  onSelectType: (t: string) => void;
  onCustomType: (v: string) => void;
  onSelectWeight: (w: string) => void;
}) {
  return (
    <View>
      <Text style={styles.sectionTitle}>Que contient le colis ?</Text>

      <View style={styles.typeGrid}>
        {PARCEL_TYPES.map((t) => {
          const active = parcelType === t.label;
          return (
            <Pressable
              key={t.label}
              style={[styles.typeCard, active && styles.typeCardActive]}
              onPress={() => onSelectType(t.label)}
            >
              <View style={[styles.typeIcon, active && styles.typeIconActive]}>
                <Ionicons name={t.icon} size={20} color={active ? '#fff' : colors.secondary} />
              </View>
              <Text style={[styles.typeLabel, active && styles.typeLabelActive]} numberOfLines={1}>
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {parcelType === 'Autre' ? (
        <View style={styles.customWrap}>
          <Field
            icon="create-outline"
            placeholder="Décris ton colis"
            value={customType}
            onChangeText={onCustomType}
          />
        </View>
      ) : null}

      <Text style={[styles.sectionTitle, styles.weightTitle]}>Poids estimé</Text>
      <View style={styles.weightRow}>
        {WEIGHTS.map((w) => {
          const active = weight === w.key;
          return (
            <Pressable
              key={w.key}
              style={[styles.weightCard, active && styles.weightCardActive]}
              onPress={() => onSelectWeight(w.key)}
            >
              <Ionicons
                name={w.icon}
                size={18}
                color={active ? colors.primary : colors.textMuted}
              />
              <Text style={[styles.weightLabel, active && styles.weightLabelActive]}>{w.label}</Text>
              <Text style={styles.weightHint}>{w.hint}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function ReceiverStep({
  receiverName,
  receiverPhone,
  note,
  onName,
  onPhone,
  onNote,
  price,
  destination,
}: {
  receiverName: string;
  receiverPhone: string;
  note: string;
  onName: (v: string) => void;
  onPhone: (v: string) => void;
  onNote: (v: string) => void;
  price: number;
  destination: Destination;
}) {
  return (
    <View>
      <Text style={styles.sectionTitle}>Qui reçoit le colis ?</Text>

      <Field
        icon="person-outline"
        label="Nom du destinataire"
        placeholder="Ex. Grâce Mavoungou"
        value={receiverName}
        onChangeText={onName}
      />
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Téléphone du destinataire</Text>
        <View style={styles.fieldWrap}>
          <PhoneInput
            value={receiverPhone}
            onChange={onPhone}
            placeholder="06 000 00 00"
          />
        </View>
      </View>
      <Field
        icon="chatbubble-outline"
        label="Note pour le coursier (optionnel)"
        placeholder="Code d'accès, instructions…"
        value={note}
        onChangeText={onNote}
        multiline
      />

      {/* Résumé */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Type de livraison</Text>
          <Text style={styles.summaryValue}>{destination === 'local' ? 'Express local' : 'Interville'}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Frais d'expédition</Text>
          <Text style={styles.summaryValue}>{price.toLocaleString('fr-FR')} FCFA</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryTotal}>Total estimé</Text>
          <Text style={styles.summaryTotalPrice}>{price.toLocaleString('fr-FR')} FCFA</Text>
        </View>
        <Text style={styles.summaryHint}>Paiement en espèces à la remise ou à la livraison.</Text>
      </View>
    </View>
  );
}

function SuccessView({
  destination,
  pickupAddress,
  dropoffAddress,
  parcelType,
  weight,
  receiverName,
  price,
  onBackHome,
}: {
  destination: Destination;
  pickupAddress: string;
  dropoffAddress: string;
  parcelType: string | null;
  weight?: string;
  receiverName: string;
  price: number;
  onBackHome: () => void;
}) {
  return (
    <ScrollView style={styles.successContainer} contentContainerStyle={styles.successContent} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['#081A4B', colors.secondary, '#18336E']} style={styles.successHero}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark" size={40} color="#fff" />
        </View>
        <Text style={styles.successTitle}>Demande en cours de traitement</Text>
        <Text style={styles.successSubtitle}>
          Votre expédition a bien été enregistrée. Un admin validera la demande et assignera un livreur.
        </Text>
      </LinearGradient>

      {/* Expéditeur */}
      <View style={styles.successBlock}>
        <View style={styles.successBlockHeader}>
          <View style={[styles.successBlockIcon, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="storefront-outline" size={16} color={colors.primary} />
          </View>
          <Text style={styles.successBlockTitle}>Adresse de l'expéditeur</Text>
        </View>
        <Text style={styles.successBlockValue}>{pickupAddress}</Text>
      </View>

      {/* Destinataire */}
      <View style={styles.successBlock}>
        <View style={styles.successBlockHeader}>
          <View style={[styles.successBlockIcon, { backgroundColor: colors.secondaryLight }]}>
            <Ionicons name="person-outline" size={16} color={colors.secondary} />
          </View>
          <Text style={styles.successBlockTitle}>Destinataire</Text>
        </View>
        <Text style={styles.successBlockValue}>{receiverName}</Text>
        <Text style={styles.successBlockSub}>{dropoffAddress}</Text>
      </View>

      {/* Récapitulatif */}
      <View style={styles.successCard}>
        <View style={styles.successRow}>
          <Text style={styles.successLabel}>Colis</Text>
          <Text style={styles.successValue}>
            {parcelType ?? '—'} {weight ? `· ${weight}` : ''}
          </Text>
        </View>
        <View style={styles.successDivider} />
        <View style={styles.successRow}>
          <Text style={styles.successLabel}>Type de livraison</Text>
          <Text style={styles.successValue}>
            {destination === 'local' ? 'Express local' : 'Interville'}
          </Text>
        </View>
        <View style={styles.successDivider} />
        <View style={styles.successRow}>
          <Text style={styles.successLabel}>Montant</Text>
          <Text style={styles.successPrice}>{price.toLocaleString('fr-FR')} FCFA</Text>
        </View>
      </View>

      <View style={styles.successInfo}>
        <Ionicons name="call-outline" size={18} color={colors.primary} />
        <Text style={styles.successInfoText}>
          Suivez votre colis depuis Profil → Mes colis une fois le livreur assigné.
        </Text>
      </View>

      <Pressable style={styles.successHomeWrap} onPress={onBackHome}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.successHomeBtn}
        >
          <Ionicons name="home-outline" size={18} color="#fff" />
          <Text style={styles.successHomeText}>Retour à l'accueil</Text>
        </LinearGradient>
      </Pressable>
    </ScrollView>
  );
}

/* ─────────────────────────── Shared ─────────────────────────── */

function Field({
  icon,
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
}: {
  icon: any;
  label?: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'phone-pad';
}) {
  return (
    <View style={styles.field}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <View style={[styles.fieldWrap, multiline && styles.fieldWrapMultiline]}>
        <Ionicons name={icon} size={18} color={colors.textMuted} />
        <AppTextInput
          style={[styles.fieldInput, multiline && styles.fieldInputMultiline]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          multiline={multiline}
          keyboardType={keyboardType}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { paddingBottom: TAB_BAR_OFFSET + 120 },

  // Hero
  hero: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  heroTitle: { color: '#fff', fontFamily: fonts.titleBold, fontSize: 19, textAlign: 'center' },

  // Stepper
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginHorizontal: 6,
  },
  stepLineActive: { backgroundColor: colors.primary },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: { backgroundColor: colors.primary },
  stepDotDone: { backgroundColor: colors.success },
  stepDotText: {
    color: 'rgba(255,255,255,0.6)',
    fontFamily: fonts.bodyBold,
    fontSize: 13,
  },
  stepDotTextActive: { color: '#fff' },
  stepLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    marginTop: spacing.sm,
  },

  stepBody: { padding: spacing.lg },

  authBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  authBannerText: {
    flex: 1,
    fontSize: 13,
    fontFamily: fonts.bodyBold,
    color: colors.primary,
  },

  // Position
  positionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    ...shadows.md,
  },
  positionIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  positionBody: { flex: 1 },
  positionLabel: {
    fontSize: 12,
    fontFamily: fonts.bodyMedium,
    color: colors.textMuted,
  },
  positionValue: {
    fontSize: 15,
    fontFamily: fonts.titleSemiBold,
    color: colors.secondary,
    marginTop: 2,
  },

  // Section titles
  sectionTitle: {
    fontSize: 16,
    fontFamily: fonts.titleBold,
    color: colors.secondary,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  weightTitle: { marginTop: spacing.xl },

  // Destination cards
  destCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadows.sm,
  },
  destCardActive: {
    borderColor: colors.primary,
    backgroundColor: '#FFFDFB',
    ...shadows.glow(colors.primaryGlow),
  },
  destIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  destBody: { flex: 1 },
  destTitle: {
    fontSize: 15,
    fontFamily: fonts.titleSemiBold,
    color: colors.secondary,
  },
  destSub: {
    fontSize: 12,
    fontFamily: fonts.bodyMedium,
    color: colors.textMuted,
    marginTop: 3,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: { borderColor: colors.primary },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },

  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#EFF6FF',
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    fontFamily: fonts.bodyMedium,
    color: '#1D4ED8',
    lineHeight: 17,
  },

  // Address
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.sm,
  },
  addressHeaderGap: { marginTop: spacing.xl },
  addressHeaderIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressTitle: {
    fontSize: 15,
    fontFamily: fonts.titleBold,
    color: colors.secondary,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  addressRowIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressRowBody: { flex: 1 },
  addressRowLabel: {
    fontSize: 14,
    fontFamily: fonts.titleSemiBold,
    color: colors.secondary,
  },
  addressRowValue: {
    fontSize: 12,
    fontFamily: fonts.bodyMedium,
    color: colors.textMuted,
    marginTop: 2,
  },

  // Fields
  field: { marginBottom: spacing.md },
  fieldLabel: {
    fontSize: 12,
    fontFamily: fonts.titleSemiBold,
    color: colors.secondary,
    marginBottom: 6,
  },
  fieldWrap: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.md,
    minHeight: 54,
  },
  fieldWrapMultiline: { alignItems: 'flex-start', paddingTop: spacing.md },
  fieldInput: { flex: 1, color: colors.text, fontFamily: fonts.bodyMedium, fontSize: 15, paddingVertical: 12 },
  fieldInputMultiline: { minHeight: 80, textAlignVertical: 'top' },

  // Parcel type
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  typeCard: {
    width: '31%',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 6,
    ...shadows.sm,
  },
  typeCardActive: {
    borderColor: colors.primary,
    backgroundColor: '#FFFDFB',
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeIconActive: { backgroundColor: colors.primary },
  typeLabel: {
    fontSize: 12,
    fontFamily: fonts.bodyMedium,
    color: colors.secondary,
  },
  typeLabelActive: { color: colors.primary, fontFamily: fonts.bodyBold },
  customWrap: { marginTop: spacing.md },

  // Weight
  weightRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  weightCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    gap: 4,
    borderWidth: 1.5,
    borderColor: colors.border,
    ...shadows.sm,
  },
  weightCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  weightLabel: {
    fontSize: 13,
    fontFamily: fonts.titleSemiBold,
    color: colors.secondary,
  },
  weightLabelActive: { color: colors.primary },
  weightHint: {
    fontSize: 10,
    fontFamily: fonts.bodyMedium,
    color: colors.textMuted,
  },

  // Summary
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    ...shadows.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  summaryLabel: { fontSize: 13, fontFamily: fonts.bodyMedium, color: colors.textMuted },
  summaryValue: { fontSize: 13, fontFamily: fonts.bodyBold, color: colors.secondary },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  summaryTotal: { fontSize: 15, fontFamily: fonts.titleBold, color: colors.secondary },
  summaryTotalPrice: { fontSize: 18, fontFamily: fonts.titleBold, color: colors.primary },
  summaryHint: {
    fontSize: 11,
    fontFamily: fonts.bodyMedium,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },

  // Bottom bar
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  bottomBarWithTabs: { marginBottom: TAB_BAR_OFFSET },
  backBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtnWrap: {
    flex: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  nextBtnDisabled: { opacity: 0.45 },
  step4Actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  backBtnInline: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  submitError: {
    color: colors.danger,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: radius.md,
  },
  nextText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: fonts.titleBold,
  },

  // Success
  successContainer: { flex: 1, backgroundColor: colors.background },
  successContent: { paddingBottom: TAB_BAR_OFFSET + 32 },
  successHero: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  successIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.glow('#10B981'),
  },
  successTitle: {
    color: '#fff',
    fontFamily: fonts.titleBold,
    fontSize: 20,
    marginTop: spacing.md,
    textAlign: 'center',
    width: '100%',
  },
  successSubtitle: {
    color: 'rgba(255,255,255,0.72)',
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    marginTop: spacing.sm,
    textAlign: 'center',
    lineHeight: 20,
    width: '100%',
    paddingHorizontal: spacing.sm,
  },
  successCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    margin: spacing.lg,
    marginTop: spacing.sm,
    padding: spacing.md,
    ...shadows.md,
  },
  successBlock: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    ...shadows.md,
  },
  successBlockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 6,
  },
  successBlockIcon: {
    width: 30,
    height: 30,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successBlockTitle: {
    fontSize: 13,
    fontFamily: fonts.titleSemiBold,
    color: colors.secondary,
  },
  successBlockValue: {
    fontSize: 14,
    fontFamily: fonts.titleBold,
    color: colors.text,
    marginTop: 2,
    lineHeight: 20,
  },
  successBlockSub: {
    fontSize: 13,
    fontFamily: fonts.bodyMedium,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 19,
  },
  successRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  successLabel: { fontSize: 12, fontFamily: fonts.bodyMedium, color: colors.textMuted },
  successValue: {
    flex: 1,
    fontSize: 13,
    fontFamily: fonts.titleSemiBold,
    color: colors.secondary,
    textAlign: 'right',
  },
  successPrice: { fontSize: 16, fontFamily: fonts.titleBold, color: colors.primary },
  successDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  successInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  successInfoText: {
    flex: 1,
    fontSize: 12,
    fontFamily: fonts.bodyMedium,
    color: colors.primary,
    lineHeight: 17,
  },
  successHomeWrap: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  successHomeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: radius.md,
  },
  successHomeText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: fonts.titleBold,
  },
});
