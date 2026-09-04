import { StyleSheet, View } from 'react-native';
import { colors } from '../theme';

/** Fond bleu identique au splash animé — évite un flash blanc au démarrage. */
export default function SplashPlaceholder() {
  return <View style={styles.root} />;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
});
