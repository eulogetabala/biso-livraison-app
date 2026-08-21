import React, { useState, useEffect, useRef } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useLoginMutation, useRegisterMutation } from '../graphql/operations';
import { useAuth } from '../lib/auth';
import { colors, radius, spacing, fonts, shadows } from '../theme';
import { Button } from '../components/ui';
import { Ionicons } from '@expo/vector-icons';
import PhoneInput from '../components/PhoneInput';
import { MOCK_MODE } from '../config/mock';
import { mockRequestOtp } from '../mocks/service';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

const { width } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const { setTokenAndUser } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+242');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [register, { loading: registering }] = useRegisterMutation();
  const [login, { loading: loggingIn }] = useLoginMutation();

  const cardScale = useRef(new Animated.Value(0.92)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(50)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  const fNameFocus = useRef(new Animated.Value(0)).current;
  const lNameFocus = useRef(new Animated.Value(0)).current;
  const phoneFocus = useRef(new Animated.Value(0)).current;
  const passFocus = useRef(new Animated.Value(0)).current;

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
    if (!firstName.trim() || !lastName.trim() || !phone.trim() || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      if (MOCK_MODE) {
        await mockRequestOtp(`${countryCode}${phone}`.replace(/\s+/g, ''));
        navigation.navigate('Otp', {
          phone: `${countryCode}${phone}`.replace(/\s+/g, ''),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          password,
        });
        return;
      }
      await register({
        variables: {
          input: {
            email: `${countryCode}${phone}`.replace(/\s+/g, '') + '@phone.biso',
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phone: `${countryCode}${phone}`.replace(/\s+/g, ''),
            password,
          },
        },
      });
      const { data } = await login({
        variables: { input: { email: `${countryCode}${phone}`.replace(/\s+/g, '') + '@phone.biso', password } },
      });
      if (!data?.login) throw new Error('Réponse invalide du serveur.');
      await setTokenAndUser(data.login.accessToken, data.login.user);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.replace('Main');
    } catch (e) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const message =
        e instanceof Error && e.message.toLowerCase().includes('email')
          ? 'Ce numéro est déjà utilisé.'
          : 'Inscription impossible. Vérifiez vos informations et réessayez.';
      setError(message);
    }
  };

  const isLoading = registering || loggingIn;

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
                <TextInput
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Jean"
                  placeholderTextColor={colors.textMuted}
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
                <TextInput
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Mbemba"
                  placeholderTextColor={colors.textMuted}
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
                placeholder="06 XXX XX XX"
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
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Au moins 6 caractères"
                placeholderTextColor={colors.textMuted}
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
