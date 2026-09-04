import React, { useState, useEffect, useRef } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useRequestOtpMutation } from '../graphql/operations';
import { isValidCongoPhoneInput, congoPhoneValidationMessage } from '../lib/phone';
import { colors, radius, spacing, fonts, shadows } from '../theme';
import { Button } from '../components/ui';
import { Ionicons } from '@expo/vector-icons';
import PhoneInput from '../components/PhoneInput';
import { AppTextInput } from '../components/AppTextInput';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

const { width } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+242');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestOtp, { loading }] = useRequestOtpMutation();

  const cardScale = useRef(new Animated.Value(0.92)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(50)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  const fNameFocus = useRef(new Animated.Value(0)).current;
  const lNameFocus = useRef(new Animated.Value(0)).current;
  const phoneFocus = useRef(new Animated.Value(0)).current;
  const passFocus = useRef(new Animated.Value(0)).current;
  const confirmPassFocus = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(150, [
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, tension: 20, friction: 6, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(cardScale, { toValue: 1, tension: 30, friction: 8, useNativeDriver: true }),
        Animated.timing(cardOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(cardTranslateY, { toValue: 0, tension: 30, friction: 8, useNativeDriver: true }),
      ]),
    ]).start();
  }, [cardScale, cardOpacity, cardTranslateY, logoScale, logoOpacity]);

  const animateInput = (anim: Animated.Value, toValue: number) => {
    Animated.timing(anim, { toValue, duration: 200, useNativeDriver: false }).start();
  };

  const makeBorder = (anim: Animated.Value) =>
    anim.interpolate({ inputRange: [0, 1], outputRange: ['transparent', colors.primary] });

  const handleSubmit = async () => {
    setError(null);
    if (!firstName.trim() || !lastName.trim() || !phone.trim() || !password || !confirmPassword) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (!isValidCongoPhoneInput(phone)) {
      setError(congoPhoneValidationMessage());
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const fullPhone = `${countryCode}${phone}`.replace(/\s+/g, '');
    try {
      await requestOtp({
        variables: { input: { phone: fullPhone } },
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.navigate('Otp', {
        phone: fullPhone,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password,
      });
    } catch (e) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const raw = e instanceof Error ? e.message : '';
      const message =
        raw.includes('incomplet') || raw.includes('06') || raw.toLowerCase().includes('phone')
          ? raw || 'Numéro de téléphone invalide. Vérifiez votre saisie.'
          : raw || "Envoi du code impossible. Vérifiez votre connexion et réessayez.";
      setError(message);
    }
  };

  const isLoading = loading;
  const confirmPassMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

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

        {/* Logo */}
        <Animated.View style={[styles.logoArea, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
          <View style={styles.logoRing}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.logoRingGradient}
            >
              <View style={styles.logoInner}>
                <Image source={require('../../assets/logo.png')} style={styles.logoImage} resizeMode="contain" />
              </View>
            </LinearGradient>
          </View>
          <Text style={styles.appName}>Créer un compte</Text>
          <Text style={styles.tagline}>Commandez en quelques clics</Text>
        </Animated.View>

        {/* Card */}
        <Animated.View
          style={[
            styles.card,
            {
              opacity: cardOpacity,
              transform: [{ scale: cardScale }, { translateY: cardTranslateY }],
            },
          ]}
        >
          {/* Name row */}
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
                  onFocus={() => animateInput(lNameFocus, 1)}
                  onBlur={() => animateInput(lNameFocus, 0)}
                />
              </Animated.View>
            </View>
          </View>

          {/* Phone */}
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
                onCountryChange={setCountryCode}
                onFocus={() => animateInput(phoneFocus, 1)}
                onBlur={() => animateInput(phoneFocus, 0)}
              />
            </Animated.View>
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mot de passe</Text>
            <Animated.View style={[styles.inputWrapper, { borderColor: makeBorder(passFocus) }]}>
              <View style={styles.inputIconCircle}>
                <Ionicons name="lock-closed-outline" size={14} color={colors.primary} />
              </View>
              <AppTextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="new-password"
                onFocus={() => animateInput(passFocus, 1)}
                onBlur={() => animateInput(passFocus, 0)}
              />
              <Pressable style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.textMuted}
                />
              </Pressable>
            </Animated.View>
          </View>

          {/* Confirm password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Répéter le mot de passe</Text>
            <Animated.View
              style={[
                styles.inputWrapper,
                {
                  borderColor: confirmPassMismatch
                    ? colors.danger
                    : makeBorder(confirmPassFocus),
                },
              ]}
            >
              <View style={styles.inputIconCircle}>
                <Ionicons name="lock-closed-outline" size={14} color={colors.primary} />
              </View>
              <AppTextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoComplete="new-password"
                onFocus={() => animateInput(confirmPassFocus, 1)}
                onBlur={() => animateInput(confirmPassFocus, 0)}
              />
              <Pressable
                style={styles.eyeBtn}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.textMuted}
                />
              </Pressable>
            </Animated.View>
            {confirmPassMismatch ? (
              <Text style={styles.mismatchText}>Les mots de passe ne correspondent pas</Text>
            ) : null}
          </View>

          {/* Password strength hint */}
          <View style={styles.strengthRow}>
            <View style={[styles.strengthDot, password.length >= 1 && styles.strengthDotActive]} />
            <View style={[styles.strengthDot, password.length >= 4 && styles.strengthDotActive]} />
            <View style={[styles.strengthDot, password.length >= 6 && styles.strengthDotActive]} />
            <View style={[styles.strengthDot, password.length >= 8 && styles.strengthDotStrong]} />
            <Text style={styles.strengthLabel}>
              {password.length === 0
                ? ''
                : password.length < 4
                  ? 'Faible'
                  : password.length < 6
                    ? 'Moyen'
                    : password.length < 8
                      ? 'Bon'
                      : 'Fort'}
            </Text>
          </View>

          {error ? (
            <View style={styles.errorCard}>
              <Ionicons name="alert-circle" size={16} color={colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Button title="S'inscrire" onPress={handleSubmit} loading={isLoading} style={styles.submit} />

          <View style={styles.trustRow}>
            <Ionicons name="shield-checkmark" size={14} color={colors.success} />
            <Text style={styles.trustText}>Vos données sont sécurisées et privées</Text>
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable style={styles.loginBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.loginBtnText}>J'ai déjà un compte</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.secondary} />
          </Pressable>
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
    height: 280,
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
  logoArea: {
    alignItems: 'center',
    marginTop: 48,
    marginBottom: spacing.md,
  },
  logoRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    marginBottom: 10,
  },
  logoRingGradient: {
    width: 88,
    height: 88,
    borderRadius: 44,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInner: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  logoImage: {
    width: 52,
    height: 52,
  },
  appName: {
    fontSize: 20,
    color: '#fff',
    fontFamily: fonts.titleBold,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
    fontFamily: fonts.bodyMedium,
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
  eyeBtn: {
    padding: 6,
    marginLeft: 4,
  },
  mismatchText: {
    color: colors.danger,
    fontSize: 12,
    fontFamily: fonts.bodyMedium,
    marginTop: 6,
  },
  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.md,
    marginTop: -spacing.sm,
  },
  strengthDot: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  strengthDotActive: {
    backgroundColor: colors.warning,
  },
  strengthDotStrong: {
    backgroundColor: colors.success,
  },
  strengthLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: fonts.bodyMedium,
    marginLeft: 6,
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
    gap: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: 12,
    color: colors.textMuted,
    fontFamily: fonts.bodyMedium,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: colors.secondaryLight,
    borderRadius: radius.md,
    height: 50,
    backgroundColor: colors.secondaryLight,
  },
  loginBtnText: {
    fontSize: 15,
    color: colors.secondary,
    fontFamily: fonts.titleSemiBold,
  },
});
