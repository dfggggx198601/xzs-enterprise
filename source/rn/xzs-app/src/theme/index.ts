import { MD3LightTheme } from 'react-native-paper';

export const colors = {
  primary: '#4A6CF7',
  primaryLight: '#7B93FA',
  primaryDark: '#3451D1',
  secondary: '#13C296',
  secondaryLight: '#4DD9B4',
  accent: '#FF6B6B',
  background: '#F5F7FB',
  surface: '#FFFFFF',
  surfaceVariant: '#F0F3FA',
  text: '#1E2A4A',
  textSecondary: '#6B7B9E',
  textLight: '#9AA5BE',
  border: '#E4E9F2',
  success: '#13C296',
  warning: '#FFAB00',
  error: '#FF4757',
  info: '#4A6CF7',
  gradientStart: '#4A6CF7',
  gradientEnd: '#6C63FF',
  cardShadow: 'rgba(74, 108, 247, 0.08)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 26,
  hero: 34,
};

export const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    background: colors.background,
    surface: colors.surface,
    error: colors.error,
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: colors.text,
    onSurface: colors.text,
  },
};

export const shadows = {
  sm: {
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: 'rgba(74, 108, 247, 0.15)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 8,
  },
};
