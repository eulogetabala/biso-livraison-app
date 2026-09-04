import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../lib/auth';
import { colors, radius, spacing, fonts, shadows } from '../theme';
import { Button } from '../components/ui';
import { AppTextInput } from '../components/AppTextInput';
import { Ionicons } from '@expo/vector-icons';
import {
  useLoginMutation,
  useRegisterMutation,
  useRequestOtpMutation,
  useVerifyOtpMutation,
} from '../graphql/operations';
import { getGraphqlErrorMessage, isUniqueConstraintError } from '../lib/graphql-errors';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

const { width } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'Otp'>;

const CODE_LENGTH = 6;

export default function OtpScreen({ navigation, route }: Props) {
  const { phone, firstName, lastName, password } = route.params;
  const { setTokenAndUser } = useAuth();

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [requestOtp] = useRequestOtpMutation();
  const [verifyOtp] = useVerifyOtpMutation();
  const [register] = useRegisterMutation();
  const [login] = useLoginMutation();

  const cardScale = useRef(new Animated.Value(0.92)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(50)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const codeFocus = useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const animateInput = (anim: Animated.Value, toValue: number) => {
    Animated.timing(anim, { toValue, duration: 200, useNativeDriver: false }).start();
  };

  const makeBorder = (anim: Animated.Value) =>
    anim.interpolate({ inputRange: [0, 1], outputRange: ['transparent', colors.primary] });

  const sendCode = async () => {
    setError(null);
    try {
      await requestOtp({ variables: { input: { phone } } });
      setCountdown(30);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impossible d’envoyer le code.');
    }
  };

  const handleVerify = async () => {
    setError(null);
    if (!/^\d{6}$/.test(code)) {
      setError('Saisissez le code à 6 chiffres reçu par SMS.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setVerifying(true);
    try {
      const { data: verifyData } = await verifyOtp({
        variables: { input: { phone, code } },
      });
      if (!verifyData?.verifyOtp) throw new Error('Code invalide.');

      try {
        const { data: regData } = await register({
          variables: {
            input: {
              firstName,
              lastName,
              phone,
              password,
              phoneVerified: true,
            },
          },
        });
        if (!regData?.createUser) throw new Error('Inscription impossible.');
      } catch (registerErr) {
        // Le numéro existe déjà (compte créé lors d'un essai précédent) :
        // on enchaîne directement sur la connexion.
        if (!isUniqueConstraintError(registerErr)) throw registerErr;
      }

      const { data: loginData } = await login({
        variables: { input: { phone, password } },
      });
      if (!loginData?.login) throw new Error('Réponse invalide du serveur.');

      await setTokenAndUser(loginData.login.accessToken, loginData.login.user);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.replace('Main');
    } catch (e) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const message = getGraphqlErrorMessage(e, '').toLowerCase();
      setError(
        message.includes('expir')
          ? 'Ce code a expiré. Renvoyez un nouveau code.'
          : message.includes('invalide')
            ? 'Code invalide. Vérifiez le code reçu.'
            : message.includes('unique') || message.includes('déjà utilisé')
              ? 'Ce numéro est déjà utilisé. Connectez-vous.'
              : message.includes('network') || message.includes('serveur') || message.includes('fetch')
                ? 'Impossible de joindre le serveur. Vérifiez votre connexion.'
                : getGraphqlErrorMessage(e, 'Vérification impossible. Réessayez.'),
      );
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setCode('');
    await sendCode();
    setResending(false);
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
          <Text style={styles.appName}>Vérification du numéro</Text>
          <Text style={styles.tagline}>Un code a été envoyé au {phone}</Text>
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
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Code de vérification</Text>
            <Animated.View style={[styles.inputWrapper, { borderColor: makeBorder(codeFocus) }]}>
              <View style={styles.inputIconCircle}>
                <Ionicons name="keypad-outline" size={16} color={colors.primary} />
              </View>
              <AppTextInput
                style={styles.input}
                typedLetterSpacing={8}
                value={code}
                onChangeText={(t) => setCode(t.replace(/[^\d]/g, '').slice(0, CODE_LENGTH))}
                placeholder="••••••"
                keyboardType="number-pad"
                maxLength={CODE_LENGTH}
                autoFocus
                onFocus={() => animateInput(codeFocus, 1)}
                onBlur={() => animateInput(codeFocus, 0)}
              />
            </Animated.View>
          </View>

          {error ? (
            <View style={styles.errorCard}>
              <Ionicons name="alert-circle" size={16} color={colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Button
            title="Vérifier et créer mon compte"
            onPress={handleVerify}
            loading={verifying}
            style={styles.submit}
            icon={<Ionicons name="shield-checkmark" size={18} color="#fff" />}
          />

          <View style={styles.resendRow}>
            <Text style={styles.resendText}>
              {countdown > 0
                ? `Renvoyer le code dans ${countdown}s`
                : "Vous n'avez pas reçu le code ? "}
            </Text>
            {countdown === 0 ? (
              <Pressable onPress={handleResend} disabled={resending} hitSlop={8}>
                <Text style={styles.resendLink}>{resending ? 'Envoi…' : 'Renvoyer'}</Text>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.trustRow}>
            <Ionicons name="shield-checkmark" size={14} color={colors.success} />
            <Text style={styles.trustText}>Ce code confirme que le numéro vous appartient</Text>
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
    height: 300,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
  },
  decorCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(254,100,0,0.08)',
    top: -60,
    right: -40,
  },
  decorCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.04)',
    bottom: -30,
    left: -30,
  },
  logoArea: {
    alignItems: 'center',
    marginTop: 56,
    marginBottom: spacing.lg,
  },
  logoRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  logoRingGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInner: {
    width: 94,
    height: 94,
    borderRadius: 47,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  logoImage: {
    width: 60,
    height: 60,
  },
  appName: {
    fontSize: 22,
    color: '#fff',
    fontFamily: fonts.titleBold,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
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
    fontSize: 12,
    color: colors.secondary,
    marginBottom: 8,
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
    height: 56,
  },
  inputIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    ...shadows.sm,
  },
  input: {
    flex: 1,
    fontSize: 20,
    color: colors.text,
    fontFamily: fonts.titleSemiBold,
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
    height: 56,
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
