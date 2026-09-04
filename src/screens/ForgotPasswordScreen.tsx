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
import { colors, radius, spacing, fonts, shadows } from '../theme';
import { Button } from '../components/ui';
import { Ionicons } from '@expo/vector-icons';
import PhoneInput from '../components/PhoneInput';
import FloatingBackButton from '../components/FloatingBackButton';
import { AppTextInput } from '../components/AppTextInput';
import { useRequestOtpMutation, useResetPasswordMutation } from '../graphql/operations';
import { isValidCongoPhoneInput, congoPhoneValidationMessage } from '../lib/phone';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

type Step = 'phone' | 'otp' | 'password' | 'done';

const CODE_LENGTH = 6;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [countryCode] = useState('+242');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [requestOtp] = useRequestOtpMutation();
  const [resetPassword] = useResetPasswordMutation();
  const [countdown, setCountdown] = useState(0);
  const [verifiedPhone, setVerifiedPhone] = useState('');

  const cardScale = useRef(new Animated.Value(0.94)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(cardScale, { toValue: 1, tension: 30, friction: 8, useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.spring(cardTranslateY, { toValue: 0, tension: 30, friction: 8, useNativeDriver: true }),
    ]).start();
  }, [cardScale, cardOpacity, cardTranslateY]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const resetStep = () => {
    setError(null);
    setLoading(false);
  };

  const handleSendCode = async () => {
    resetStep();
    if (!phone.trim()) {
      setError('Entrez votre numéro de téléphone.');
      return;
    }
    if (!isValidCongoPhoneInput(phone)) {
      setError(congoPhoneValidationMessage());
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    try {
      const fullPhone = `${countryCode}${phone}`.replace(/\s+/g, '');
      const { data } = await requestOtp({ variables: { input: { phone: fullPhone } } });
      setVerifiedPhone(data?.requestOtp.phone ?? fullPhone);
      setCountdown(30);
      setStep('otp');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(e instanceof Error ? e.message : 'Impossible d’envoyer le code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = () => {
    resetStep();
    if (!/^\d{6}$/.test(code)) {
      setError('Saisissez le code à 6 chiffres reçu par SMS.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep('password');
  };

  const handleResend = async () => {
    setCode('');
    setError(null);
    setLoading(true);
    try {
      const fullPhone = `${countryCode}${phone}`.replace(/\s+/g, '');
      const { data } = await requestOtp({ variables: { input: { phone: fullPhone } } });
      setVerifiedPhone(data?.requestOtp.phone ?? fullPhone);
      setCountdown(30);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impossible d’envoyer le code.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    resetStep();
    if (!password || password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    try {
      const fullPhone = verifiedPhone || `${countryCode}${phone}`.replace(/\s+/g, '');
      await resetPassword({ variables: { input: { phone: fullPhone, code, password } } });
      setStep('done');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const raw = e instanceof Error ? e.message : '';
      const lower = raw.toLowerCase();
      const message =
        lower.includes('expir')
          ? 'Ce code a expiré. Renvoyez un nouveau code.'
          : lower.includes('invalide') || lower.includes('invalid')
            ? 'Code invalide. Vérifiez le code reçu.'
            : lower.includes('aucun code')
              ? 'Demandez un nouveau code SMS.'
              : raw || 'Réinitialisation impossible.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const stepMeta: Record<Step, { icon: string; title: string; subtitle: string }> = {
    phone: {
      icon: 'keypad-outline',
      title: 'Mot de passe oublié',
      subtitle: 'Entrez votre numéro pour recevoir un code',
    },
    otp: {
      icon: 'shield-checkmark-outline',
      title: 'Vérification',
      subtitle: `Un code a été envoyé au ${countryCode}${phone}`,
    },
    password: {
      icon: 'lock-closed-outline',
      title: 'Nouveau mot de passe',
      subtitle: 'Choisissez un mot de passe sécurisé',
    },
    done: {
      icon: 'checkmark-circle-outline',
      title: 'Mot de passe réinitialisé',
      subtitle: 'Vous pouvez vous reconnecter avec votre nouveau mot de passe',
    },
  };

  const meta = stepMeta[step];

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
            <Ionicons name={meta.icon as any} size={22} color="#fff" />
          </View>
          <Text style={styles.title}>{meta.title}</Text>
          <Text style={styles.subtitle}>{meta.subtitle}</Text>
        </Animated.View>

        {step !== 'done' ? <FloatingBackButton navigation={navigation} /> : null}

        {/* Card */}
        <Animated.View
          style={[
            styles.card,
            { opacity: cardOpacity, transform: [{ scale: cardScale }, { translateY: cardTranslateY }] },
          ]}
        >
          {step === 'phone' ? (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Numéro de téléphone</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIconCircle}>
                    <Ionicons name="call-outline" size={14} color={colors.primary} />
                  </View>
                  <PhoneInput
                    value={phone}
                    countryCode={countryCode}
                    onChange={setPhone}
                    placeholder="06 XXX XX XX"
                  />
                </View>
              </View>

              {error ? (
                <View style={styles.errorCard}>
                  <Ionicons name="alert-circle" size={16} color={colors.danger} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <Button title="Envoyer le code" onPress={handleSendCode} loading={loading} style={styles.submit} />

              <View style={styles.infoRow}>
                <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
                <Text style={styles.infoText}>Vous recevrez un code SMS pour vérifier votre identité.</Text>
              </View>
            </>
          ) : null}

          {step === 'otp' ? (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Code de vérification</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIconCircle}>
                    <Ionicons name="keypad-outline" size={14} color={colors.primary} />
                  </View>
                  <AppTextInput
                    style={[styles.input, styles.codeInput]}
                    typedLetterSpacing={8}
                    value={code}
                    onChangeText={(t) => setCode(t.replace(/[^\d]/g, '').slice(0, CODE_LENGTH))}
                    placeholder="••••••"
                    keyboardType="number-pad"
                    maxLength={CODE_LENGTH}
                    autoFocus
                  />
                </View>
              </View>

              {error ? (
                <View style={styles.errorCard}>
                  <Ionicons name="alert-circle" size={16} color={colors.danger} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <Button title="Continuer" onPress={handleVerify} style={styles.submit} />

              <View style={styles.resendRow}>
                <Text style={styles.resendText}>
                  {countdown > 0
                    ? `Renvoyer le code dans ${countdown}s`
                    : "Vous n'avez pas reçu le code ? "}
                </Text>
                {countdown === 0 ? (
                  <Pressable onPress={handleResend} disabled={loading} hitSlop={8}>
                    <Text style={styles.resendLink}>{loading ? 'Envoi…' : 'Renvoyer'}</Text>
                  </Pressable>
                ) : null}
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="shield-checkmark-outline" size={16} color={colors.success} />
                <Text style={styles.infoText}>Saisissez le code reçu par SMS pour confirmer votre identité.</Text>
              </View>
            </>
          ) : null}

          {step === 'password' ? (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nouveau mot de passe</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIconCircle}>
                    <Ionicons name="lock-closed-outline" size={14} color={colors.primary} />
                  </View>
                  <AppTextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Au moins 6 caractères"
                    secureTextEntry={!showPassword}
                    autoComplete="new-password"
                  />
                  <Pressable style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={colors.textMuted}
                    />
                  </Pressable>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirmer le mot de passe</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIconCircle}>
                    <Ionicons name="lock-closed-outline" size={14} color={colors.primary} />
                  </View>
                  <AppTextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Répétez le mot de passe"
                    secureTextEntry={!showPassword}
                    autoComplete="new-password"
                  />
                </View>
              </View>

              {error ? (
                <View style={styles.errorCard}>
                  <Ionicons name="alert-circle" size={16} color={colors.danger} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <Button title="Réinitialiser" onPress={handleReset} loading={loading} style={styles.submit} />
            </>
          ) : null}

          {step === 'done' ? (
            <View style={styles.doneWrap}>
              <View style={styles.doneIconWrap}>
                <Ionicons name="checkmark" size={34} color="#fff" />
              </View>
              <Text style={styles.doneTitle}>C'est fait !</Text>
              <Text style={styles.doneText}>
                Votre mot de passe a été réinitialisé. Vous pouvez vous reconnecter avec vos nouvelles informations.
              </Text>
              <Button title="Se connecter" onPress={() => navigation.navigate('Login')} style={styles.submit} />
            </View>
          ) : null}
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
  codeInput: {
    fontSize: 20,
    fontFamily: fonts.titleSemiBold,
  },
  eyeBtn: {
    padding: 6,
    marginLeft: 4,
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
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    gap: spacing.xs,
  },
  resendText: {
    color: colors.textMuted,
    fontSize: 14,
    fontFamily: fonts.bodyMedium,
  },
  resendLink: {
    color: colors.primary,
    fontSize: 14,
    fontFamily: fonts.titleSemiBold,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  infoText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: fonts.bodyMedium,
    lineHeight: 18,
  },
  doneWrap: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  doneIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.glow(colors.success),
  },
  doneTitle: {
    fontSize: 18,
    color: colors.secondary,
    fontFamily: fonts.titleBold,
    marginBottom: spacing.sm,
  },
  doneText: {
    fontSize: 13,
    color: colors.textMuted,
    fontFamily: fonts.bodyMedium,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
});
