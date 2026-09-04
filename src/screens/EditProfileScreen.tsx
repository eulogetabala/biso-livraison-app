import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../lib/auth';
import { colors, radius, spacing, fonts, shadows } from '../theme';
import { Button } from '../components/ui';
import { Ionicons } from '@expo/vector-icons';
import PhoneInput from '../components/PhoneInput';
import { AppTextInput } from '../components/AppTextInput';
import FloatingBackButton from '../components/FloatingBackButton';
import { useUpdateProfileMutation } from '../graphql/operations';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;

export default function EditProfileScreen({ navigation }: Props) {
  const { user, setUser } = useAuth();

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [phone, setPhone] = useState((user?.phone ?? '').replace(/^\+242/, ''));
  const [countryCode] = useState('+242');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [updateProfile] = useUpdateProfileMutation();

  const cardScale = useRef(new Animated.Value(0.94)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(40)).current;

  const fNameFocus = useRef(new Animated.Value(0)).current;
  const lNameFocus = useRef(new Animated.Value(0)).current;
  const phoneFocus = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(cardScale, { toValue: 1, tension: 30, friction: 8, useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.spring(cardTranslateY, { toValue: 0, tension: 30, friction: 8, useNativeDriver: true }),
    ]).start();
  }, [cardScale, cardOpacity, cardTranslateY]);

  const animateInput = (anim: Animated.Value, toValue: number) => {
    Animated.timing(anim, { toValue, duration: 200, useNativeDriver: false }).start();
  };

  const makeBorder = (anim: Animated.Value) =>
    anim.interpolate({ inputRange: [0, 1], outputRange: ['transparent', colors.primary] });

  const handleSave = async () => {
    setError(null);
    if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSaving(true);
    try {
      const fullPhone = `${countryCode}${phone}`.replace(/\s+/g, '');
      const { data } = await updateProfile({
        variables: {
          input: {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phone: fullPhone,
          },
        },
      });
      if (!data?.updateProfile) throw new Error('Réponse invalide');
      await setUser(data.updateProfile as any);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch (e) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(e instanceof Error ? e.message : 'Impossible de modifier vos informations.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Gradient hero */}
        <LinearGradient
          colors={[colors.secondary, colors.secondaryDark, '#000D2B']}
          style={styles.heroGradient}
        >
          <View style={styles.decorCircle1} />
          <View style={styles.decorCircle2} />
        </LinearGradient>

        {/* Titre centré */}
        <Animated.View style={[styles.titleArea, { opacity: cardOpacity }]}>
          <View style={styles.titleIconWrap}>
            <Ionicons name="create-outline" size={22} color="#fff" />
          </View>
          <Text style={styles.title}>Mes informations</Text>
          <Text style={styles.subtitle}>Mettez à jour votre profil</Text>
        </Animated.View>

        <FloatingBackButton navigation={navigation} />

        {/* Card */}
        <Animated.View
          style={[
            styles.card,
            { opacity: cardOpacity, transform: [{ scale: cardScale }, { translateY: cardTranslateY }] },
          ]}
        >
          <View style={styles.nameRow}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Prénom</Text>
              <Animated.View style={[styles.inputWrapper, { borderColor: makeBorder(fNameFocus) }]}>
                <View style={styles.inputIconCircle}>
                  <Ionicons name="person-outline" size={14} color={colors.primary} />
                </View>
                <AppTextInput
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Jean"
                  autoCapitalize="words"
                  onFocus={() => animateInput(fNameFocus, 1)}
                  onBlur={() => animateInput(fNameFocus, 0)}
                />
              </Animated.View>
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Nom</Text>
              <Animated.View style={[styles.inputWrapper, { borderColor: makeBorder(lNameFocus) }]}>
                <View style={styles.inputIconCircle}>
                  <Ionicons name="person-outline" size={14} color={colors.primary} />
                </View>
                <AppTextInput
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Mbemba"
                  autoCapitalize="words"
                  onFocus={() => animateInput(lNameFocus, 1)}
                  onBlur={() => animateInput(lNameFocus, 0)}
                />
              </Animated.View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Numéro de téléphone</Text>
            <Animated.View style={[styles.inputWrapper, { borderColor: makeBorder(phoneFocus) }]}>
              <View style={styles.inputIconCircle}>
                <Ionicons name="call-outline" size={14} color={colors.primary} />
              </View>
              <PhoneInput
                value={phone}
                countryCode={countryCode}
                onChange={setPhone}
                placeholder="06 XXX XX XX"
                onFocus={() => animateInput(phoneFocus, 1)}
                onBlur={() => animateInput(phoneFocus, 0)}
              />
            </Animated.View>
          </View>

          {error ? (
            <View style={styles.errorCard}>
              <Ionicons name="alert-circle" size={16} color={colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Button title="Enregistrer" onPress={handleSave} loading={saving} style={styles.submit} />

          <View style={styles.trustRow}>
            <Ionicons name="shield-checkmark" size={14} color={colors.success} />
            <Text style={styles.trustText}>Vos données restent privées et sécurisées</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 240,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
  },
  decorCircle1: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(254,100,0,0.08)',
    top: -50,
    right: -30,
  },
  decorCircle2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.04)',
    bottom: -20,
    left: -20,
  },
  titleArea: {
    alignItems: 'center',
    marginTop: 64,
    marginBottom: spacing.lg,
  },
  titleIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    color: '#fff',
    fontFamily: fonts.titleBold,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
    fontFamily: fonts.bodyMedium,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.lg,
  },
  nameRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 11,
    color: colors.secondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontFamily: fonts.titleSemiBold,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    height: 52,
  },
  inputIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    ...shadows.sm,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    fontFamily: fonts.bodyMedium,
    height: '100%',
    paddingVertical: 0,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    fontFamily: fonts.bodyMedium,
    flex: 1,
  },
  submit: {
    marginTop: spacing.sm,
    height: 54,
    borderRadius: radius.md,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    gap: 6,
  },
  trustText: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: fonts.bodyMedium,
  },
});
