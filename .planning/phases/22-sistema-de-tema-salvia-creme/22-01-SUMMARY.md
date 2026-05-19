---
phase: 22-sistema-de-tema-salvia-creme
plan: 01
subsystem: design-tokens
tags: [theme, design-system, typography, dependencies]
requires: []
provides:
  - "Theme / ThemeName — tipos da API de tema Salvia & Creme"
  - "themes — registro dos 3 temas (default, terracota, sereno-escuro)"
  - "resolveTheme — resolvedor de ThemeName -> Theme com fallback"
  - "fonts / NUNITO_FONT_MAP — tokens de fonte Nunito prontos para useFonts"
affects:
  - "src/App.tsx — plano 22-02 consome resolveTheme + makeStyles + useFonts"
  - "fases 23 e 24 — restyling de telas consome a API de tema"
tech-stack:
  added:
    - "expo-font (~14.0.11) — runtime de carregamento de fonte"
    - "@expo-google-fonts/nunito (^0.4.2) — assets Nunito 400/600/700/800"
  patterns:
    - "Dois sistemas de design coexistem em src/theme.ts (legacy iOS + Salvia & Creme) ate a fase 25"
    - "Asset modules .ttf/.otf declarados em expo-env.d.ts para tsc --noEmit"
key-files:
  created:
    - "expo-env.d.ts — declaracoes de modulo de asset .ttf/.otf"
  modified:
    - "src/theme.ts — API nova de tema adicionada lado a lado com exports legacy"
    - "package.json / package-lock.json — dependencias da fonte Nunito"
decisions:
  - "expo-env.d.ts criado para declarar .ttf — necessario para importar os pesos da Nunito sob tsc --noEmit"
  - "app.json mantido sem config plugin expo-font — Nunito carrega via useFonts em runtime"
metrics:
  duration: "~4 min"
  completed: 2026-05-19
---

# Phase 22 Plan 01: Sistema de Tema "Salvia & Creme" Summary

Estendeu `src/theme.ts` com a API de tema "Salvia & Creme" (3 temas terrosos, tokens de fonte Nunito, raios generosos, sombras quentes) lado a lado com os exports legacy iOS preservados verbatim; instalou `expo-font` + `@expo-google-fonts/nunito`.

## What Was Built

- **Task 1 — Dependencias Nunito.** Instalou `expo-font` (~14.0.11) e `@expo-google-fonts/nunito` (^0.4.2) via `npx expo install` (versoes alinhadas ao Expo SDK 54). `app.json` mantido sem config plugin — a Nunito carrega via `useFonts` em runtime.
- **Task 2 — API de tema em theme.ts.** Adicionou um bloco novo apos os exports legacy:
  - Tipos `Theme` e `ThemeName` (`'default' | 'terracota' | 'sereno-escuro'`), exportados.
  - `themes`: registro dos 3 temas completos com valores portados literalmente de `sources/themes/{default,terracota,sereno-escuro}.css`.
  - `resolveTheme(name)`: resolvedor com fallback para `default`.
  - `fonts`: nomes de familia Nunito (regular/semibold/bold/extrabold).
  - `NUNITO_FONT_MAP`: mapa pronto para `useFonts` (plano 02).
  - Tokens compartilhados: `themeRadii` (10/16/22/30/9999), `themeSpacing` (4..32), `themeTypography` (escala Nunito sem `fontWeight`), `warmShadows` (tinta `#4A3F2B`) e `darkShadows` (preto, para sereno-escuro).
  - Exports legacy iOS (`colors`, `typography`, `radii`, `spacing`, `shadows`, `palette`, `tiles`, `CHILD_GRID_COLUMNS`) preservados verbatim — nenhum valor ou chave alterado, nenhum re-apontamento.

## Key Implementation Details

- O tipo `Theme` tem chaves proprias e e separado dos consts legacy — sem conflito de nome.
- A escala tipografica e identica nos 3 temas; so a cor varia (via `colors`). Peso vem da familia Nunito, nao de `fontWeight`.
- Cabecalho do arquivo reescrito documentando os DOIS sistemas (legacy iOS + Salvia & Creme) e a coexistencia ate a fase 25.
- Nomes de familia de fonte confirmados inspecionando `node_modules/@expo-google-fonts/nunito/index.js`: `Nunito_400Regular`, `Nunito_600SemiBold`, `Nunito_700Bold`, `Nunito_800ExtraBold`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Criado expo-env.d.ts para declarar modulos de asset .ttf**
- **Found during:** Task 2
- **Issue:** Importar os pesos `.ttf` da Nunito em `src/theme.ts` quebraria `tsc --noEmit` — o projeto nao tinha declaracao de modulo `*.ttf` e a base `expo/tsconfig.base` nao inclui uma. O plano exige importar os 4 pesos no topo do arquivo, o que seria impossivel sem isso.
- **Fix:** Criado `expo-env.d.ts` na raiz (nome convencional do Expo) com `/// <reference types="expo/types" />` e declaracoes `declare module '*.ttf'` / `'*.otf'`.
- **Files modified:** expo-env.d.ts (novo)
- **Commit:** 7a0dfbf

**2. [Rule 3 - Blocking] Revertida adicao automatica do plugin expo-font ao app.json**
- **Found during:** Task 1
- **Issue:** `npx expo install` adicionou automaticamente `"expo-font"` ao array `plugins` de `app.json`. O plano instrui explicitamente a NAO adicionar config plugin (a Nunito carrega via `useFonts` em runtime, sem rebuild nativo).
- **Fix:** Removida a entrada `"expo-font"` de `app.json`, deixando o arquivo identico ao estado anterior.
- **Files modified:** app.json (revertido — sem mudanca liquida)
- **Commit:** n/a (sem alteracao final no arquivo)

## Verification

- `npm run lint` (`tsc --noEmit`): passa limpo em todo o projeto, incluindo `src/ui/*` (6 primitivos) e `src/App.tsx` que continuam consumindo os exports legacy intactos.
- `npm run test`: 22/26 — exatamente as 4 falhas pre-existentes herdadas (arasaacService), nenhuma nova.
- Greps de acceptance criteria: todos os 18 confirmados (`export const themes`, `resolveTheme`, `NUNITO_FONT_MAP`, `#6F9D86`, `#C9805C`, `#211F1B`, `Nunito_400Regular`, `Nunito_800ExtraBold`, `systemBlue: '#007AFF'`, `pill: 999`, e os 8 exports legacy).

## Known Stubs

Nenhum. Esta fase entrega apenas tokens — o consumo em runtime (`useFonts`, `makeStyles`, troca de tema) e do plano 22-02.

## Commits

- `64d284a`: chore(22-01): instalar dependencias da fonte Nunito
- `7a0dfbf`: feat(22-01): adicionar sistema de tema Salvia & Creme a theme.ts

## Self-Check: PASSED

- FOUND: src/theme.ts
- FOUND: expo-env.d.ts
- FOUND: package.json (deps expo-font + @expo-google-fonts/nunito)
- FOUND commit: 64d284a
- FOUND commit: 7a0dfbf
