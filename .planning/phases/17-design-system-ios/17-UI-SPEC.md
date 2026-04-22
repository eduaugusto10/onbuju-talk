---
phase: 17
slug: design-system-ios
status: approved
shadcn_initialized: false
preset: ios-light
created: 2026-04-21
---

# Phase 17 — UI Design Contract

> Visual and interaction contract for the iOS design system (tokens + primitivos).
> Este contrato define o alvo visual que as Phases 18-20 consomem.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | custom tokens em `src/theme.ts` + primitivos em `src/ui/` |
| Preset | iOS light mode (inspirado em Apple HIG) |
| Component library | none (somente primitivos nativos `react-native`) |
| Icon library | emoji nativo (SF Symbols via expo-symbols deferido — fora de escopo v5) |
| Font | system default (SF Pro no iOS, Roboto no Android) — sem fontFamily explícita |
| Native deps | `expo-haptics`, `expo-blur` (instalados nesta phase; consumidos em 19/20) |

---

## Spacing Scale

Tokens numéricos exportados em `src/theme.ts`. Todos múltiplos de 4 (4-point grid).

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Gap entre ícone e texto inline |
| sm | 8px | Padding interno compacto (rows, chips pequenos) |
| md | 12px | Padding padrão de card / padding vertical em list rows |
| lg | 16px | Padding padrão de section, gap entre cards |
| xl | 20px | Padding de containers maiores |
| xxl | 24px | Quebra entre seções inset grouped list |

Exceptions: `hairlineWidth` usado para separadores (≈0.5px em retina).

---

## Typography

Escala iOS alinhada a Apple HIG. Valores em `src/theme.ts` como objetos com `fontSize` + `lineHeight` + `fontWeight`.

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| largeTitle | 34 | 700 | 41 |
| title1 | 28 | 700 | 34 |
| title2 | 22 | 700 | 28 |
| title3 | 20 | 600 | 25 |
| headline | 17 | 600 | 22 |
| body | 17 | 400 | 22 |
| callout | 16 | 400 | 21 |
| subheadline | 15 | 400 | 20 |
| footnote | 13 | 400 | 18 |
| caption1 | 12 | 400 | 16 |
| caption2 | 11 | 400 | 13 |

Nenhum `fontSize` hardcoded fora de `theme.ts` após adoção gradual (Phase 17 migra apenas header; Phases 18-20 migram o resto).

---

## Color

Paleta iOS light mode. Semantic naming aproximado ao HIG. Dark mode e semantic adaptativo deferidos.

| Role | Value | Usage |
|------|-------|-------|
| systemBlue | #007AFF | Accent iOS (botão filled, active pill, link) |
| label | #000000 | Texto principal |
| secondaryLabel | #3C3C4399 (rgba 60,60,67,0.6) | Texto secundário, captions |
| tertiaryLabel | #3C3C434D (rgba 60,60,67,0.3) | Placeholder, texto desabilitado |
| fill | #78788033 (rgba 120,120,128,0.2) | Fill secundário — botão tinted bg, chip active bg-tint |
| secondaryFill | #78788029 (rgba 120,120,128,0.16) | Categorias inactive pills bg |
| systemBackground | #FFFFFF | Fundo de sheets, cards brancos |
| secondarySystemBackground | #F2F2F7 | Fundo da tela principal |
| systemGroupedBackground | #F2F2F7 | Fundo de telas agrupadas (config) |
| secondarySystemGroupedBackground | #FFFFFF | Fundo de cards dentro de grouped lists |
| separator | #3C3C4349 (rgba 60,60,67,0.29) | Hairline separator entre rows |
| systemGray | #8E8E93 | Ícones secundários, chevrons |
| systemGray6 | #F2F2F7 | Search field bg |
| destructive | #FF3B30 | Botão destrutivo, erro |
| success | #34C759 | (raro; ex. check de passo concluído) |
| warning | #FF9500 | (raro) |
| highContrastBackground | #020617 | Preserva modo alto contraste atual |
| highContrastText | #FFFFFF | Texto em alto contraste |

Accent reserved for: botões primários "Gerar"/"Ouvir"/"Salvar", categoria selecionada, star de favorito, indicador de voz gravada, chevrons ativos, row destacada em config. Nunca em bordas decorativas genéricas ou em todos os elementos interativos.

---

## Radii & Shadows

| Token | Value | Usage |
|-------|-------|-------|
| radii.sm | 8px | Chips pequenos, search field interno |
| radii.md | 12px | Cards padrão, botões |
| radii.lg | 16px | Grouped list sections, sheets |
| radii.xl | 20px | Sheets largos, hero elements |
| radii.pill | 999 | Pills de categoria, badges |

| Shadow | Params | Usage |
|--------|--------|-------|
| shadows.sm | opacity 0.05, radius 2, offset {0,1}, elevation 1 | Cards na grade |
| shadows.md | opacity 0.08, radius 6, offset {0,2}, elevation 3 | Sheets leves, dropdowns |
| shadows.lg | opacity 0.12, radius 16, offset {0,8}, elevation 8 | Modal headers, sheets altos |

---

## Primitivos (src/ui/)

Contratos de API pública dos componentes criados na Phase 17.

| Primitivo | Props essenciais | Variantes |
|-----------|------------------|-----------|
| IOSButton | `label`, `onPress`, `variant`, `size?`, `icon?`, `disabled?`, `destructive?`, `style?`, `testID?` | `filled` (systemBlue bg + white text) / `tinted` (fill bg + systemBlue text) / `plain` (no bg, systemBlue text) |
| IOSCard | `children`, `padding?`, `style?`, `testID?` | padrão: systemBackground, radii.lg, shadows.sm, padding md |
| IOSListSection | `header?`, `footer?`, `children`, `style?` | grouped inset com header UPPERCASE e footer caption |
| IOSListRow | `label`, `accessory?`, `onPress?`, `icon?`, `style?`, `isFirst?`, `isLast?` | row com hairline interno, cantos arredondados quando isFirst/isLast |
| IOSSectionHeader | `title`, `style?` | caption1 uppercase em secondaryLabel |
| IOSBottomSheet | `visible`, `onRequestClose`, `title?`, `leftAction?`, `rightAction?`, `children`, `maxHeight?` | base com grabber, safe-area bottom inset, header opcional; blur backdrop entra em Phase 19 |

Todos expõem `style` e `testID` pass-through. Todos são functional components com memoização onde apropriado.

---

## Copywriting Contract

Phase 17 não introduz copy novo no produto — apenas adota tokens no header existente. Copy do header e botões permanece inalterado. Contratos de copy específicos para as próximas fases:

| Element | Copy (pt-BR) |
|---------|--------------|
| IOSBottomSheet left action default | Cancelar |
| IOSBottomSheet right action default (save) | Salvar |
| IOSBottomSheet right action default (confirm) | Pronto |
| IOSButton destructive default label | Remover |

Outras strings permanecem com os copys atuais de cada tela.

---

## Accessibility & Contrast

- `contrastMode === 'alto'` (pré-existente em milestones anteriores) continua suportado. Primitivos aceitam overrides via `style` prop para permitir que o consumidor troque cores quando alto contraste estiver ativo.
- `uiScale` (pré-existente) afeta `fontSize` do `body`/`headline` via multiplicador no consumidor. Os tokens typography não aplicam scale internamente — scale permanece responsabilidade do consumidor (como hoje).
- Touch targets mínimos de 44×44 em botões e rows (iOS HIG).

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| custom (src/ui/) | IOSButton, IOSCard, IOSListSection, IOSListRow, IOSSectionHeader, IOSBottomSheet | N/A — código próprio; revisão manual |
| expo | expo-haptics, expo-blur | versões alinhadas via `npx expo install` |

Nenhuma biblioteca de UI externa introduzida.

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS (sem copy novo no produto; contratos default pt-BR definidos para primitivos)
- [x] Dimension 2 Visuals: PASS (tokens alinhados com iOS HIG; primitivos cobrem shapes padrão)
- [x] Dimension 3 Color: PASS (paleta iOS semantic; accent systemBlue com escopo claro)
- [x] Dimension 4 Typography: PASS (escala iOS completa com line heights corretos)
- [x] Dimension 5 Spacing: PASS (4-point grid; tokens 4/8/12/16/20/24 batem com ROADMAP)
- [x] Dimension 6 Registry Safety: PASS (sem registries externos; deps expo alinhadas via install)

**Approval:** approved 2026-04-21 (auto-approved — spec derivado diretamente de ROADMAP.md + REQUIREMENTS.md + Apple HIG; nenhum conflito detectado com CONTEXT.md).
