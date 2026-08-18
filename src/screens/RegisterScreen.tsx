import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLoginMutation, useRegisterMutation } from '../graphql/operations';
import { useAuth } from '../lib/auth';
import { colors, radius, spacing } from '../theme';
import { Button } from '../components/ui';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const { setTokenAndUser } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [register, { loading: registering }] = useRegisterMutation();
  const [login, { loading: loggingIn }] = useLoginMutation();

  const handleSubmit = async () => {
    setError(null);
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim() || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    try {
      await register({
        variables: {
          input: {
            email: email.trim().toLowerCase(),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phone: phone.trim(),
            password,
          },
        },
      });
      const { data } = await login({
        variables: { input: { email: email.trim().toLowerCase(), password } },
      });
      if (!data?.login) throw new Error('Réponse invalide du serveur.');
      await setTokenAndUser(data.login.accessToken, data.login.user);
      navigation.replace('Main');
    } catch (e) {
      const message =
        e instanceof Error && e.message.toLowerCase().includes('email')
          ? 'Cet email est déjà utilisé.'
          : 'Inscription impossible. Vérifiez vos informations et réessayez.';
      setError(message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Créer un compte</Text>
        <Text style={styles.subtitle}>Commandez en quelques clics</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Prénom</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Jean"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={styles.label}>Nom</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Dupont"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="vous@exemple.com"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />

          <Text style={styles.label}>Téléphone</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="06 12 34 56 78"
            placeholderTextColor={colors.textMuted}
            keyboardType="phone-pad"
            autoComplete="tel"
          />

          <Text style={styles.label}>Mot de passe</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Au moins 6 caractères"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            autoComplete="new-password"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            title="S'inscrire"
            onPress={handleSubmit}
            loading={registering || loggingIn}
            style={styles.submit}
          />

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Déjà un compte ? </Text>
            <Text style={styles.loginLink} onPress={() => navigation.goBack()}>
              Se connecter
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  title: { fontSize: 24, fontWeight: '800', color: colors.text, textAlign: 'center' },
  subtitle: { fontSize: 15, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.lg },
  form: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: spacing.xs, marginTop: spacing.md },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: '#fff',
  },
  error: { color: colors.danger, fontSize: 14, marginTop: spacing.md },
  submit: { marginTop: spacing.lg },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  loginText: { color: colors.textMuted, fontSize: 14 },
  loginLink: { color: colors.primary, fontSize: 14, fontWeight: '600' },
});
