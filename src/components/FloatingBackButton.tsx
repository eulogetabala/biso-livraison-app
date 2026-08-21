import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadows } from '../theme';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/types';

type Props = {
  navigation: NavigationProp<RootStackParamList>;
  /** Couleur du fond (par défaut blanc avec ombre). */
  background?: string;
  /** Couleur de l'icône (par défaut primary). */
  tint?: string;
  /** Offset horizontal (défaut 16). */
  left?: number;
  /** Offset vertical supplémentaire par rapport au safe area. */
  topOffset?: number;
};

/**
 * Bouton retour flottant, positionné en haut à gauche sous le safe area.
 * Remplace le header natif tout en gardant une navigation intuitive.
 */
export default function FloatingBackButton({
  navigation,
  background = colors.surface,
  tint = colors.primary,
  left = 16,
  topOffset = 6,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { top: insets.top + topOffset, left }]}>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: background },
          pressed && styles.buttonPressed,
        ]}
        onPress={() => navigation.goBack()}
        hitSlop={8}
      >
        <Ionicons name="chevron-back" size={22} color={tint} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    zIndex: 50,
  },
  button: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
});
