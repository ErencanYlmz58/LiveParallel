import { COLORS } from './colors';

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FONTS = {
  regular: {
    fontFamily: 'System',
    fontWeight: 'normal',
  },
  medium: {
    fontFamily: 'System',
    fontWeight: '500',
  },
  bold: {
    fontFamily: 'System',
    fontWeight: 'bold',
  },
  light: {
    fontFamily: 'System',
    fontWeight: '300',
  },
};

export const TEXT = {
  header: {
    ...FONTS.bold,
    fontSize: 24,
    color: COLORS.TEXT,
  },
  title: {
    ...FONTS.bold,
    fontSize: 20,
    color: COLORS.TEXT,
  },
  subtitle: {
    ...FONTS.medium,
    fontSize: 16,
    color: COLORS.TEXT,
  },
  body: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.TEXT,
  },
  caption: {
    ...FONTS.regular,
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
  },
  button: {
    ...FONTS.medium,
    fontSize: 16,
    color: COLORS.BACKGROUND,
  },
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 20,
  pill: 1000,
};

export const theme = {
  colors: COLORS,
  spacing: SPACING,
  fonts: FONTS,
  text: TEXT,
  shadows: SHADOWS,
  borderRadius: BORDER_RADIUS,
};

export default theme;