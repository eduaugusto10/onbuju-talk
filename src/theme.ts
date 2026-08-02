/**
 * Tokens de design — Fala Mobile
 *
 * Este modulo contem DOIS sistemas de design lado a lado:
 *
 * (a) DESIGN SYSTEM iOS LEGACY (v5) — exports `colors`, `typography`, `radii`,
 *     `spacing`, `shadows`, `palette`, `tiles`, `CHILD_GRID_COLUMNS`. Paleta
 *     iOS azul (systemBlue, labels, fills, grouped backgrounds). Consumido
 *     pelos 6 primitivos em `src/ui/*` e por alguns sites de `src/App.tsx`.
 *     PERMANECE VERBATIM ate a limpeza da fase 25 — NAO re-apontar para a
 *     API nova; chaves como `systemBlue`, `label`, `separator`, `radii.pill`
 *     nao existem na paleta Salvia & Creme.
 *
 * (b) SISTEMA "SALVIA & CREME" (milestone v6) — tipo `Theme`/`ThemeName`,
 *     registro `themes`, resolvedor `resolveTheme`, tokens de fonte `fonts`
 *     e `NUNITO_FONT_MAP`. Paleta terrosa de baixo estimulo sensorial, fonte
 *     Nunito, raios generosos e sombras suaves tingidas de quente. 3 temas
 *     selecionaveis: `default` (Salvia & Creme), `terracota`, `sereno-escuro`.
 *     Esta e a API que as fases 22 (plano 02), 23 e 24 consomem.
 *
 * Os dois conjuntos coexistem deliberadamente durante a milestone v6. O plano
 * 02 migra `src/App.tsx` para a API nova; `src/ui/*` continua nos exports
 * legacy ate a fase 25, quando os legacy serao removidos.
 *
 * Valores do sistema Salvia & Creme portados literalmente de
 * `.claude/skills/sketch-findings-fala/sources/themes/{default,terracota,sereno-escuro}.css`.
 */

import type { TextStyle, ViewStyle } from 'react-native';
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold
} from '@expo-google-fonts/nunito';

// ############################################################################
// # BLOCO 1 — DESIGN SYSTEM iOS LEGACY (v5)
// # Consumido por src/ui/* e src/App.tsx. NAO re-apontar para a API nova.
// # Remocao/limpeza destes exports e da fase 25.
// ############################################################################

// ============================================================================
// Cores (iOS system palette, light mode) — LEGACY
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
// Tipografia (escala iOS alinhada ao HIG) — LEGACY
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
// Raios — LEGACY (chave `pill` consumida por src/ui/*; ausente na API nova)
// ============================================================================

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999
} as const;

// ============================================================================
// Espacamento (4-point grid) — LEGACY
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
// Sombras (iOS-like sutis) — LEGACY
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
// Legacy exports adicionais (compatibilidade com o header atual) — LEGACY
// Removidos na fase 25 junto com os demais exports iOS. NAO re-apontar.
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

// ############################################################################
// # BLOCO 2 — SISTEMA "SALVIA & CREME" (milestone v6)
// # API nova de tema. Nomes proprios, separada do bloco legacy acima.
// # Valores portados de sources/themes/{default,terracota,sereno-escuro}.css.
// ############################################################################

// ============================================================================
// Tipografia Nunito — familias de fonte
// ============================================================================

/**
 * Nomes de familia de fonte da Nunito, exatamente como `@expo-google-fonts/nunito`
 * os registra. Sao as chaves carregadas via `useFonts(NUNITO_FONT_MAP)` (plano 02);
 * uma vez carregadas, podem ser usadas em `fontFamily` de qualquer `TextStyle`.
 */
export const fonts = {
  regular: 'Nunito_400Regular',
  semibold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extrabold: 'Nunito_800ExtraBold'
} as const;

/**
 * Mapa pronto para passar ao hook `useFonts` de `expo-font` no plano 02.
 * Chave = nome de familia; valor = asset .ttf importado.
 */
export const NUNITO_FONT_MAP = {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold
} as const;

// ============================================================================
// Tipos da API de tema "Salvia & Creme"
// ============================================================================

type ThemeName = 'default' | 'terracota' | 'sereno-escuro';

type ThemeColors = {
  /** Fundo da tela (creme quente / carvao quente). */
  bg: string;
  /** Fundo de areas agrupadas, um pouco mais fundo. */
  bgSoft: string;
  /** Superficie de cards. */
  surface: string;
  /** Superficie secundaria. */
  surface2: string;
  /** Moldura suave. */
  border: string;
  /** Moldura de maior contraste. */
  borderStrong: string;
  /** Texto principal — quase-preto quente, nunca preto puro. */
  text: string;
  /** Texto secundario / cinza quente. */
  textMuted: string;
  /** Texto terciario, ainda mais suave. */
  textSoft: string;
  /** Cor de estado ativo / selecionado. */
  primary: string;
  primaryHover: string;
  primarySoft: string;
  primaryInk: string;
  /** Ouro quente — a acao "magica" Gerar (IA). */
  generate: string;
  generateHover: string;
  generateSoft: string;
  generateInk: string;
  /** Acao heroi — Ouvir / falar. */
  accent: string;
  accentHover: string;
  accentSoft: string;
  /** Tinta sobre `accent` — escura o suficiente para contraste WCAG AA (≥4.5:1). */
  accentInk: string;
  /** Status. */
  danger: string;
  dangerSoft: string;
  success: string;
  /** Cor de favorito / destaque. */
  star: string;
};

type ThemeRadii = {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  full: number;
};

type ThemeSpacing = {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  xxxl: number;
};

type ThemeShadowToken = Pick<
  ViewStyle,
  'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'
>;

type ThemeShadows = {
  sm: ThemeShadowToken;
  md: ThemeShadowToken;
  lg: ThemeShadowToken;
};

/** Token tipografico da API nova — peso vem da familia Nunito, nao de `fontWeight`. */
type ThemeTypographyToken = Pick<TextStyle, 'fontSize' | 'lineHeight' | 'fontFamily'>;

type ThemeTypography = {
  largeTitle: ThemeTypographyToken;
  title1: ThemeTypographyToken;
  title2: ThemeTypographyToken;
  title3: ThemeTypographyToken;
  headline: ThemeTypographyToken;
  body: ThemeTypographyToken;
  callout: ThemeTypographyToken;
  subheadline: ThemeTypographyToken;
  footnote: ThemeTypographyToken;
  caption1: ThemeTypographyToken;
  caption2: ThemeTypographyToken;
};

/** Um tema completo da paleta "Salvia & Creme". */
type Theme = {
  name: ThemeName;
  isDark: boolean;
  colors: ThemeColors;
  radii: ThemeRadii;
  spacing: ThemeSpacing;
  shadows: ThemeShadows;
  typography: ThemeTypography;
};

export type { Theme, ThemeName };

// ============================================================================
// Tokens compartilhados entre os 3 temas (raios, espacamento, tipografia)
// ============================================================================

const themeRadii: ThemeRadii = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 30,
  full: 9999
};

const themeSpacing: ThemeSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32
};

// Escala tipografica Nunito — identica nos 3 temas (so a cor varia, via `colors`).
const themeTypography: ThemeTypography = {
  largeTitle: { fontSize: 30, lineHeight: 38, fontFamily: fonts.extrabold },
  title1: { fontSize: 24, lineHeight: 30, fontFamily: fonts.extrabold },
  title2: { fontSize: 20, lineHeight: 26, fontFamily: fonts.bold },
  title3: { fontSize: 18, lineHeight: 24, fontFamily: fonts.bold },
  headline: { fontSize: 17, lineHeight: 22, fontFamily: fonts.bold },
  body: { fontSize: 17, lineHeight: 23, fontFamily: fonts.regular },
  callout: { fontSize: 16, lineHeight: 21, fontFamily: fonts.regular },
  subheadline: { fontSize: 15, lineHeight: 20, fontFamily: fonts.semibold },
  footnote: { fontSize: 13, lineHeight: 18, fontFamily: fonts.regular },
  caption1: { fontSize: 12, lineHeight: 16, fontFamily: fonts.semibold },
  caption2: { fontSize: 11, lineHeight: 14, fontFamily: fonts.regular }
};

// Sombras suaves tingidas de quente — temas claros (default + terracota).
const warmShadows: ThemeShadows = {
  sm: {
    shadowColor: '#4A3F2B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 1
  },
  md: {
    shadowColor: '#4A3F2B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.09,
    shadowRadius: 16,
    elevation: 3
  },
  lg: {
    shadowColor: '#4A3F2B',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.13,
    shadowRadius: 34,
    elevation: 8
  }
};

// Sombras do tema escuro — pretas e mais densas (de sereno-escuro.css).
const darkShadows: ThemeShadows = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 1
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.38,
    shadowRadius: 16,
    elevation: 3
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.46,
    shadowRadius: 34,
    elevation: 8
  }
};

// ============================================================================
// Tema "default" — Salvia & Creme (de sources/themes/default.css)
// ============================================================================

const defaultTheme: Theme = {
  name: 'default',
  isDark: false,
  colors: {
    bg: '#F1EBDD',
    bgSoft: '#E8E0CD',
    surface: '#FCFAF4',
    surface2: '#F5F0E3',
    border: '#E2D8C2',
    borderStrong: '#CABD9D',
    text: '#3B362D',
    textMuted: '#8B8372',
    textSoft: '#B3AA94',
    primary: '#6F9D86',
    primaryHover: '#5C8872',
    primarySoft: '#DBE6DE',
    primaryInk: '#2E4A3E',
    generate: '#E0A24E',
    generateHover: '#CD9140',
    generateSoft: '#F6E6C7',
    generateInk: '#4A330E',
    accent: '#D08A63',
    accentHover: '#BC7853',
    accentSoft: '#F0DCCE',
    accentInk: '#42250F',
    danger: '#C57E6F',
    dangerSoft: '#EFDBD4',
    success: '#7FA982',
    star: '#E2B24C'
  },
  radii: themeRadii,
  spacing: themeSpacing,
  shadows: warmShadows,
  typography: themeTypography
};

// ============================================================================
// Tema "terracota" — variacao mais quente (de sources/themes/terracota.css)
// ============================================================================

const terracotaTheme: Theme = {
  name: 'terracota',
  isDark: false,
  colors: {
    bg: '#F0E6D8',
    bgSoft: '#E6D8C5',
    surface: '#FDFAF3',
    surface2: '#F5EBDA',
    border: '#E5D4BD',
    borderStrong: '#CFB896',
    text: '#3F352B',
    textMuted: '#91806C',
    textSoft: '#B8A88F',
    primary: '#C9805C',
    primaryHover: '#B56E4C',
    primarySoft: '#F0DDCE',
    primaryInk: '#5C3725',
    generate: '#DDA04B',
    generateHover: '#CA8F3E',
    generateSoft: '#F5E4C3',
    generateInk: '#4A330E',
    accent: '#6F9D86',
    accentHover: '#5C8872',
    accentSoft: '#DBE6DE',
    accentInk: '#16291F',
    danger: '#BF6A5C',
    dangerSoft: '#EFD6CF',
    success: '#7FA982',
    star: '#E2B24C'
  },
  radii: themeRadii,
  spacing: themeSpacing,
  shadows: warmShadows,
  typography: themeTypography
};

// ============================================================================
// Tema "sereno-escuro" — modo escuro calmo (de sources/themes/sereno-escuro.css)
// ============================================================================

const serenoEscuroTheme: Theme = {
  name: 'sereno-escuro',
  isDark: true,
  colors: {
    bg: '#211F1B',
    bgSoft: '#1A1916',
    surface: '#2C2A24',
    surface2: '#34322B',
    border: '#423F36',
    borderStrong: '#565244',
    text: '#F0EADC',
    textMuted: '#A9A18C',
    textSoft: '#7C7565',
    primary: '#8FBBA3',
    primaryHover: '#A2C9B3',
    primarySoft: '#33453C',
    primaryInk: '#EAF3EC',
    generate: '#E8B468',
    generateHover: '#F0C17E',
    generateSoft: '#4A3B22',
    generateInk: '#4A330E',
    accent: '#E0A07C',
    accentHover: '#EBAE8C',
    accentSoft: '#46362C',
    accentInk: '#3A2213',
    danger: '#D89384',
    dangerSoft: '#45302B',
    success: '#8FBBA3',
    star: '#E8C572'
  },
  radii: themeRadii,
  spacing: themeSpacing,
  shadows: darkShadows,
  typography: themeTypography
};

// ============================================================================
// Registro de temas e resolvedor
// ============================================================================

/** Registro dos 3 temas selecionaveis da paleta "Salvia & Creme". */
export const themes: Record<ThemeName, Theme> = {
  'default': defaultTheme,
  'terracota': terracotaTheme,
  'sereno-escuro': serenoEscuroTheme
};

/**
 * Resolve um `ThemeName` para o objeto `Theme` correspondente.
 * Faz fallback para o tema `default` se o nome for desconhecido (ex.: valor
 * legado/corrompido vindo da persistencia).
 */
export function resolveTheme(name: ThemeName): Theme {
  return themes[name] ?? themes['default'];
}
