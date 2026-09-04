import { Image, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { assetUrl } from '../lib/api';
import { colors, fonts, radius } from '../theme';

type Props = {
  coverImageUrl?: string | null;
  logoImageUrl?: string | null;
  height: number;
  width?: number | `${number}%`;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  logoSize?: number;
  nameFallback?: string;
};

export default function RestaurantCoverImage({
  coverImageUrl,
  logoImageUrl,
  height,
  width = '100%',
  borderRadius = 0,
  style,
  logoSize = 48,
  nameFallback,
}: Props) {
  const coverUri = assetUrl(coverImageUrl ?? logoImageUrl);
  const logoUri = assetUrl(logoImageUrl);
  const showLogo = Boolean(logoUri && logoUri !== coverUri);

  return (
    <View style={[{ width, height, borderRadius, overflow: 'hidden' }, style]}>
      {coverUri ? (
        <Image source={{ uri: coverUri }} style={StyleSheet.absoluteFill} />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.placeholder]} />
      )}

      {showLogo ? (
        <View style={[styles.logoWrap, { width: logoSize, height: logoSize, borderRadius: logoSize * 0.22 }]}>
          <Image source={{ uri: logoUri }} style={styles.logoImage} />
        </View>
      ) : nameFallback ? (
        <View style={[styles.logoWrap, styles.logoFallback, { width: logoSize, height: logoSize, borderRadius: logoSize * 0.22 }]}>
          <Text style={[styles.logoFallbackText, { fontSize: logoSize * 0.38 }]}>{nameFallback.slice(0, 1)}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: colors.border,
  },
  logoWrap: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#eef2f9',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  logoFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoFallbackText: {
    fontFamily: fonts.titleBold,
    color: colors.textMuted,
  },
});
