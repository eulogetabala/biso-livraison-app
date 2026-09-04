import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { fonts, inputTheme } from '../theme';

export type AppTextInputProps = TextInputProps & {
  containerStyle?: StyleProp<ViewStyle>;
  /** Espacement des lettres appliqué uniquement quand du texte est saisi. */
  typedLetterSpacing?: number;
};

export function AppTextInput({
  placeholder,
  value,
  style,
  containerStyle,
  typedLetterSpacing,
  multiline,
  ...rest
}: AppTextInputProps) {
  const text = value ?? '';
  const hasValue = text.length > 0;
  const flatStyle = StyleSheet.flatten(style) as TextStyle | undefined;

  return (
    <View style={[styles.container, multiline && styles.containerMultiline, containerStyle]}>
      <TextInput
        {...rest}
        value={value}
        multiline={multiline}
        placeholder=""
        placeholderTextColor="transparent"
        style={[
          styles.input,
          style,
          hasValue && typedLetterSpacing != null ? { letterSpacing: typedLetterSpacing } : null,
        ]}
      />
      {!hasValue && placeholder ? (
        <View
          pointerEvents="none"
          style={[
            styles.placeholderOverlay,
            multiline && styles.placeholderOverlayMultiline,
            flatStyle?.paddingHorizontal != null && { paddingHorizontal: flatStyle.paddingHorizontal },
            flatStyle?.paddingLeft != null && { paddingLeft: flatStyle.paddingLeft },
          ]}
        >
          <Text
            numberOfLines={multiline ? 2 : 1}
            style={[
              styles.placeholderText,
              multiline && styles.placeholderTextMultiline,
            ]}
          >
            {placeholder}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'center',
    position: 'relative',
  },
  containerMultiline: {
    justifyContent: 'flex-start',
    minHeight: 72,
  },
  input: {
    padding: 0,
    margin: 0,
    textAlignVertical: 'center',
  },
  placeholderOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
  },
  placeholderOverlayMultiline: {
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  placeholderText: {
    color: inputTheme.placeholderColor,
    fontSize: inputTheme.placeholderFontSize,
    fontFamily: fonts.bodyMedium,
    letterSpacing: 0,
    lineHeight: inputTheme.placeholderFontSize + 2,
  },
  placeholderTextMultiline: {
    lineHeight: inputTheme.placeholderFontSize + 4,
  },
});
