/**
 * Design System iOS — Fala Mobile (v5)
 *
 * Tokens centralizados alinhados ao Apple Human Interface Guidelines (light mode).
 * Consumidos pelos primitivos em `src/ui/` e pelos componentes da tela principal.
 *
 * Grupos exportados:
 *  - `colors`     — paleta iOS (systemBlue, labels, fills, grouped backgrounds, grays, destructive).
 *  - `typography` — escala iOS (largeTitle..caption2), cada um com `fontSize`, `lineHeight`, `fontWeight`.
 *  - `radii`      — raios padrao iOS (sm 8, md 12, lg 16, xl 20, pill).
 *  - `spacing`    — escala 4-point (xs 4, sm 8, md 12, lg 16, xl 20, xxl 24).
 *  - `shadows`    — 3 niveis sutis (sm/md/lg) com `elevation` correspondente para Android.
 *
 * Exemplo de uso:
 *
 * ```tsx
 * import { colors, typography, radii, spacing, shadows } from './theme';
 *
 * const styles = StyleSheet.create({
 *   card: {
 *     backgroundColor: colors.secondarySystemGroupedBackground,
 *     borderRadius: radii.lg,
 *     padding: spacing.lg,
 *     ...shadows.sm,
 *   },
 *   title: {
 *     color: colors.label,
 *     ...typography.headline,
 *   },
 * });
 * ```
 *
 * Dark mode / semantic adaptativo e deferido para milestone futura (ver REQUIREMENTS.md §Future).
 * Exports legacy (`palette`, `tiles`, `CHILD_GRID_COLUMNS`) sao mantidos apenas para
 * compatibilidade com o header atual enquanto a milestone v5 migra. Remocao dos legacy
 * e cleanup da Phase 21.
 */

import type { TextStyle, ViewStyle } from 'react-native';

// ============================================================================
// Cores (iOS system palette, light mode)
// ============================================================================

export const colors = {
  // Accent
  systemBlue: '#007AFF',

  // Text labels
  label: '#000000',
  secondaryLabel: 'rgba(60, 60, 67, 0.6)',
  tertiaryLabel: 'rgba(60, 60, 67, 0.3)',
  quaternaryLabel: 'rgba(60, 60, 67, 0.18)',

  // Fills (tap-highlight backgrounds, chips)
  fill: 'rgba(120, 120, 128, 0.2)',
  secondaryFill: 'rgba(120, 120, 128, 0.16)',
  tertiaryFill: 'rgba(118, 118, 128, 0.12)',
  quaternaryFill: 'rgba(116, 116, 128, 0.08)',

  // Backgrounds
  systemBackground: '#FFFFFF',
  secondarySystemBackground: '#F2F2F7',
  tertiarySystemBackground: '#FFFFFF',
  systemGroupedBackground: '#F2F2F7',
  secondarySystemGroupedBackground: '#FFFFFF',

  // Separators
  separator: 'rgba(60, 60, 67, 0.29)',
  opaqueSeparator: '#C6C6C8',

  // Grays (iOS system grays)
  systemGray: '#8E8E93',
  systemGray2: '#AEAEB2',
  systemGray3: '#C7C7CC',
  systemGray4: '#D1D1D6',
  systemGray5: '#E5E5EA',
  systemGray6: '#F2F2F7',

  // Semantic
  destructive: '#FF3B30',
  success: '#34C759',
  warning: '#FF9500',

  // High-contrast overrides (preservados da v4)
  highContrastBackground: '#020617',
  highContrastText: '#FFFFFF'
} as const;

// ============================================================================
// Tipografia (escala iOS alinhada ao HIG)
// ============================================================================

type TypographyToken = Pick<TextStyle, 'fontSize' | 'lineHeight' | 'fontWeight'>;

export const typography = {
  largeTitle: { fontSize: 34, lineHeight: 41, fontWeight: '700' } as TypographyToken,
  title1: { fontSize: 28, lineHeight: 34, fontWeight: '700' } as TypographyToken,
  title2: { fontSize: 22, lineHeight: 28, fontWeight: '700' } as TypographyToken,
  title3: { fontSize: 20, lineHeight: 25, fontWeight: '600' } as TypographyToken,
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600' } as TypographyToken,
  body: { fontSize: 17, lineHeight: 22, fontWeight: '400' } as TypographyToken,
  callout: { fontSize: 16, lineHeight: 21, fontWeight: '400' } as TypographyToken,
  subheadline: { fontSize: 15, lineHeight: 20, fontWeight: '400' } as TypographyToken,
  footnote: { fontSize: 13, lineHeight: 18, fontWeight: '400' } as TypographyToken,
  caption1: { fontSize: 12, lineHeight: 16, fontWeight: '400' } as TypographyToken,
  caption2: { fontSize: 11, lineHeight: 13, fontWeight: '400' } as TypographyToken
} as const;

// ============================================================================
// Raios
// ============================================================================

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999
} as const;

// ============================================================================
// Espacamento (4-point grid)
// ============================================================================

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24
} as const;

// ============================================================================
// Sombras (iOS-like sutis)
// ============================================================================

type ShadowToken = Pick<
  ViewStyle,
  'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'
>;

export const shadows: {
  sm: ShadowToken;
  md: ShadowToken;
  lg: ShadowToken;
} = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8
  }
};

// ============================================================================
// Legacy exports (compatibilidade com header atual; remove em Phase 21)
// ============================================================================

export const palette = {
  background: '#F7F4ED',
  backgroundHighContrast: '#020617',
  card: '#FFFFFF',
  cardBorder: '#E8E1D2',
  primary: '#5B8C7A',
  primaryDark: '#3F6656',
  primarySoft: '#D9E7E0',
  accent: '#E8B86E',
  text: '#2B2A28',
  textMuted: '#6B6A67',
  danger: '#C06B5E',
  dangerSoft: '#F5E0DB',
  chipBg: '#EFEAE0',
  chipActive: '#5B8C7A'
};

export const tiles = {
  minHeight: 160,
  image: 96,
  padding: 12
};

export const CHILD_GRID_COLUMNS = 3;
