import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme';

type Props = {
  /** Numéro complet (ex. "+242066123456") ou déjà national. */
  phone?: string | null;
  /** Couleur du numéro (défaut texte). */
  tint?: string;
  /** Taille du texte du numéro. */
  size?: number;
};

/**
 * Affichage d'un numéro de téléphone avec le pays statique (🇨🇬 +242),
 * cohérent avec le PhoneInput utilisé dans les formulaires.
 */
export default function PhoneNumber({ phone, tint = colors.text, size = 14 }: Props) {
  if (!phone) return null;
  const national = phone.replace(/^\+242/, '').trim();
  return (
    <View style={styles.row}>
      <View style={styles.badge}>
        <Text style={styles.flag}>🇨🇬</Text>
        <Text style={[styles.code, { fontSize: size - 2 }]}>+242</Text>
      </View>
      <Text style={[styles.number, { color: tint, fontSize: size }]}>{national}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  flag: {
    fontSize: 13,
  },
  code: {
    fontFamily: fonts.bodyBold,
    color: colors.secondary,
  },
  number: {
    fontFamily: fonts.bodyMedium,
    letterSpacing: 0.5,
  },
});
