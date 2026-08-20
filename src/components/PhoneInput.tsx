import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, radius, fonts } from '../theme';

type Props = {
  value: string;
  countryCode: string;
  onChange: (val: string) => void;
  onCountryChange: (code: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
};

export default function PhoneInput({ value, onChange, placeholder, onFocus, onBlur }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.countryPill}>
        <Text style={styles.flag}>🇨🇬</Text>
        <Text style={styles.code}>+242</Text>
      </View>
      <View style={styles.separator} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder ?? '06 XXX XX XX'}
        placeholderTextColor={colors.textMuted}
        keyboardType="phone-pad"
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
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
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 4,
    fontFamily: fonts.bodyMedium,
    color: colors.text,
    fontSize: 16,
    paddingVertical: 0,
    letterSpacing: 0.8,
  },
});
