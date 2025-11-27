import { StyleSheet } from 'react-native';

// Color Palette
export const jewelleryColors = {
  primary: '#D4AF37',      // Gold - main yellow theme color
  secondary: '#2B6B7F',    // Teal - for Gemologist category
  accent: '#7B3FF2',       // Purple - for Designers category
  categoryGold: '#D4AF37',  // Shops
  categoryBlue: '#3B82F6', // Vendors
  categoryOrange: '#F97316', // Workers
  categoryPurple: '#7B3FF2', // Designers
  categoryTeal: '#2B6B7F',  // Gemologist
  success: '#22C55E',      // Green for checkmarks
  error: '#EF4444',        // Red
  text: '#1F2937',         // Dark gray
  textSecondary: '#6B7280', // Light gray
  bg: '#FFFFFF',
  bgSecondary: '#F3F4F6',
  bgDark: '#1E293B',       // Dark blue for banner
  border: '#E5E7EB',
};

// Typography Tokens
export const typography = {
  heading1: {
    fontSize: 30,
    fontWeight: '600',
    lineHeight: 36,
    color: jewelleryColors.text,
  },
  heading2: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 28,
    color: jewelleryColors.text,
  },
  heading3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 24,
    color: jewelleryColors.text,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 20,
    color: jewelleryColors.text,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 18,
    color: jewelleryColors.textSecondary,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: jewelleryColors.textSecondary,
  },
};

// Spacing Tokens
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Common Styles
export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: jewelleryColors.bg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  card: {
    backgroundColor: jewelleryColors.bg,
    borderRadius: 12,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default {
  colours: jewelleryColors,
  typography,
  spacing,
  commonStyles,
};

