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
import { useLoginMutation } from '../graphql/operations';
import { useAuth } from '../lib/auth';
import { colors, radius, spacing } from '../theme';
import { Button } from '../components/ui';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { setTokenAndUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [login, { loading }] = useLoginMutation();

  const handleSubmit = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    try {
      const { data } = await login({
        variables: {
          input: { email: email.trim().toLowerCase(), password },
        },
      });
      if (!data?.login) throw new Error('Réponse invalide du serveur.');
      await setTokenAndUser(data.login.accessToken, data.login.user);
      navigation.replace('Main');
    } catch (e) {
      const message =
        e instanceof Error && e.message.includes('Invalid credentials')
          ? 'Email ou mot de passe incorrect.'
          : 'Connexion impossible. Vérifiez votre connexion et réessayez.';
      setError(message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.logo}>Biso Livraison</Text>
          <Text style={styles.tagline}>Connectez-vous pour commander</Text>
        </View>

        <View style={styles.form}>
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

          <Text style={styles.label}>Mot de passe</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            autoComplete="password"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button title="Se connecter" onPress={handleSubmit} loading={loading} style={styles.submit} />

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Pas encore de compte ? </Text>
            <Text style={styles.registerLink} onPress={() => navigation.navigate('Register')}>
              S'inscrire
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  logo: { fontSize: 32, fontWeight: '800', color: colors.primary },
  tagline: { fontSize: 15, color: colors.textMuted, marginTop: spacing.xs },
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
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  registerText: { color: colors.textMuted, fontSize: 14 },
  registerLink: { color: colors.primary, fontSize: 14, fontWeight: '600' },
});
