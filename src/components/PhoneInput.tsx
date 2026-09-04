import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, radius, fonts, inputTheme } from '../theme';

type Props = {
  value: string;
  countryCode?: string;
  onChange: (val: string) => void;
  onCountryChange?: (code: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
};

export default function PhoneInput({ value, onChange, placeholder, onFocus, onBlur }: Props) {
  const hint = placeholder?.trim();

  return (
    <View style={styles.row}>
      <View style={styles.countryPill}>
        <Text style={styles.flag}>🇨🇬</Text>
        <Text style={styles.code}>+242</Text>
      </View>
      <View style={styles.separator} />
      <View style={styles.inputWrap}>
        {!value && hint ? (
          <View pointerEvents="none" style={styles.placeholderOverlay}>
            <Text numberOfLines={1} style={styles.placeholder}>
              {hint}
            </Text>
          </View>
        ) : null}
        <TextInput
          style={[styles.input, value.length > 0 && styles.inputFilled]}
          value={value}
          onChangeText={onChange}
          placeholder=""
          placeholderTextColor="transparent"
          keyboardType="phone-pad"
          textAlignVertical="center"
          onFocus={onFocus}
          onBlur={onBlur}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    flex: 1,
  },
  countryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    gap: 6,
  },
  flag: {
    fontSize: 18,
  },
  code: {
    fontSize: 15,
    fontFamily: fonts.bodyBold,
    color: colors.secondary,
    letterSpacing: 0.5,
  },
  separator: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
    marginHorizontal: 10,
  },
  inputWrap: {
    flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'center',
    position: 'relative',
  },
  placeholderOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  placeholder: {
    color: inputTheme.placeholderColor,
    fontSize: inputTheme.placeholderFontSize,
    fontFamily: fonts.bodyMedium,
    letterSpacing: 0,
    lineHeight: inputTheme.placeholderFontSize + 2,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 4,
    fontFamily: fonts.bodyMedium,
    color: colors.text,
    fontSize: 16,
    paddingVertical: 0,
    letterSpacing: 0,
  },
  inputFilled: {
    letterSpacing: 0.4,
  },
});
