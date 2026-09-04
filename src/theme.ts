export const colors = {
  primary: '#FE6400',
  primaryDark: '#D55400',
  primaryLight: '#FFF3EC',
  primaryGlow: 'rgba(254, 100, 0, 0.15)',
  secondary: '#002774',
  secondaryDark: '#001C53',
  secondaryLight: '#E6EAF1',
  background: '#F4F6FA',
  surface: '#FFFFFF',
  text: '#0E1726',
  textMuted: '#62758F',
  border: '#E1E6EE',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  glass: 'rgba(255,255,255,0.85)',
  glassBorder: 'rgba(255,255,255,0.3)',
};

/** Style des placeholders de champs texte (plus discrets que le texte saisi). */
export const inputTheme = {
  placeholderColor: 'rgba(98, 117, 143, 0.38)',
  placeholderFontSize: 14,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  xs: 8,
  sm: 12,
  md: 20,
  lg: 28,
  xl: 36,
  full: 9999,
};

export const fonts = {
  titleBold: 'Montserrat_700Bold',
  titleSemiBold: 'Montserrat_600SemiBold',
  bodyRegular: 'PlusJakartaSans_400Regular',
  bodyMedium: 'PlusJakartaSans_500Medium',
  bodyBold: 'PlusJakartaSans_700Bold',
};

export const shadows = {
  sm: {
    shadowColor: '#002774',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#002774',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: '#002774',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  }),
};
