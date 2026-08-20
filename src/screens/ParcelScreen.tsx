import React, { useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { Button } from '../components/ui';
import { colors, fonts, radius, shadows, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Parcel'>;

export default function ParcelScreen({}: Props) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [description, setDescription] = useState('');
  const glow = useRef(new Animated.Value(0.7)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0.7, duration: 1400, useNativeDriver: true }),
      ]),
    ).start();
  }, [glow]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['#081A4B', colors.secondary, '#18336E']} style={styles.hero}>
        <Text style={styles.heroTitle}>Expédier un colis</Text>
        <Text style={styles.heroSubtitle}>Envoie un petit colis dans Brazzaville ou vers Pointe-Noire avec un parcours simple.</Text>
      </LinearGradient>

      <Animated.View style={[styles.ctaCard, { opacity: glow }]}>
        <LinearGradient colors={['#ffffff', '#F8FAFF']} style={styles.ctaGradient}>
          <View style={styles.ctaRow}>
            <View style={styles.ctaIcon}>
              <Ionicons name="cube-outline" size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.ctaTitle}>Livraison locale</Text>
              <Text style={styles.ctaText}>Brazzaville en express, avec suivi et coursier disponible.</Text>
            </View>
          </View>
          <View style={styles.ctaRow}>
            <View style={[styles.ctaIcon, { backgroundColor: '#EEF2FF' }]}>
              <Ionicons name="swap-horizontal-outline" size={22} color="#4F46E5" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.ctaTitle}>Interville</Text>
              <Text style={styles.ctaText}>Brazzaville → Pointe-Noire pour les petits colis prioritaires.</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      <View style={styles.formCard}>
        <Field icon="navigate-outline" label="Adresse de départ" value={from} onChangeText={setFrom} placeholder="Ex. Moungali, Brazzaville" />
        <Field icon="location-outline" label="Adresse d’arrivée" value={to} onChangeText={setTo} placeholder="Ex. Centre-ville, Pointe-Noire" />
        <Field icon="document-text-outline" label="Description du colis" value={description} onChangeText={setDescription} placeholder="Documents, colis léger, gâteau..." multiline />
        <Button title="Demander une expédition" style={{ marginTop: spacing.md }} />
      </View>
    </ScrollView>
  );
}

function Field({
  icon,
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
}: {
  icon: any;
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.fieldWrap, multiline && styles.fieldWrapMultiline]}>
        <Ionicons name={icon} size={18} color={colors.textMuted} />
        <TextInput
          style={[styles.fieldInput, multiline && styles.fieldInputMultiline]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          multiline={multiline}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxl },
  hero: {
    paddingTop: 24,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  heroTitle: { color: '#fff', fontFamily: fonts.titleBold, fontSize: 26 },
  heroSubtitle: { color: 'rgba(255,255,255,0.72)', fontFamily: fonts.bodyMedium, fontSize: 13, marginTop: 6, lineHeight: 18 },
  ctaCard: {
    marginHorizontal: spacing.lg,
    marginTop: -spacing.lg,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.lg,
  },
  ctaGradient: { padding: spacing.lg, gap: spacing.md },
  ctaRow: { flexDirection: 'row', gap: spacing.md },
  ctaIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaTitle: { color: colors.secondary, fontFamily: fonts.titleSemiBold, fontSize: 16 },
  ctaText: { color: colors.textMuted, fontFamily: fonts.bodyMedium, fontSize: 13, marginTop: 4, lineHeight: 18 },
  formCard: {
    margin: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  field: { marginBottom: spacing.md },
  fieldLabel: { color: colors.secondary, fontFamily: fonts.titleSemiBold, fontSize: 13, marginBottom: 6 },
  fieldWrap: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.md,
    minHeight: 54,
  },
  fieldWrapMultiline: { alignItems: 'flex-start', paddingTop: spacing.md },
  fieldInput: { flex: 1, color: colors.text, fontFamily: fonts.bodyMedium, fontSize: 15 },
  fieldInputMultiline: { minHeight: 90, textAlignVertical: 'top' },
});
