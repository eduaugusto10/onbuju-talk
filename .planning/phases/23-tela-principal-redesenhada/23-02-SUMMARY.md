---
phase: 23-tela-principal-redesenhada
plan: 02
subsystem: ui-tela-principal
tags: [visual, categorias, busca, tema, nunito]
requires:
  - "src/theme.ts — API de tema Salvia & Creme (fase 22)"
  - "23-01 — header reestilizado + categoryColors.ts"
provides:
  - "Barra de categorias (pills) reestilizada com tokens de tema"
  - "Campo de busca e container da lista (listCard) com a paleta Salvia & Creme"
affects:
  - "src/App.tsx (makeStyles — categorias, busca, listCard; JSX do ActivityIndicator)"
tech-stack:
  added: []
  patterns:
    - "Tokens theme.colors / theme.radii / theme.spacing / theme.typography aplicados aos estilos de categorias e busca"
    - "Cor da pill ativa = theme.colors.primary (salvia); inativa = theme.colors.bgSoft (neutro suave)"
key-files:
  created: []
  modified:
    - src/App.tsx
decisions:
  - "categoryButtonTextActive e searchButtonText mantem texto branco literal (#FFFFFF) sobre salvia — salvia e escura o suficiente para contraste; tokens de cor do tema nao tem um 'onPrimary' dedicado."
  - "inputHighContrast preservado verbatim — array legado ainda referenciado no JSX; fora do escopo deste plano (coberto pelo tema sereno-escuro)."
metrics:
  duration: ~3min
  completed: 2026-05-19
  tasks: 2
  files: 1
---

# Phase 23 Plan 02: Tela Principal Redesenhada (Categorias + Busca + listCard) Summary

Barra de categorias, campo de busca e container da lista da tela principal reestilizados com os tokens "Salvia & Creme": pills de categoria em salvia (ativo) / neutro suave (inativo), busca com fundo suave e cantos generosos, listCard sobre o fundo agrupado quente — substituindo a estetica iOS azul. Textos de categoria e busca passam a usar `theme.typography.*` (fonte Nunito), avancando o fechamento do gap VIS-02.

## What Was Built

### Task 1 — Barra de categorias reestilizada (commit `ca67c91`)
Estilos `makeStyles` em `src/App.tsx`:
- `categoryButton`: `backgroundColor: theme.colors.bgSoft`, `borderRadius: theme.radii.full` (pill). Paddings e `minHeight` mantidos.
- `categoryButtonActive`: `backgroundColor: theme.colors.primary` (salvia).
- `categoryButtonText`: espalha `theme.typography.subheadline` (Nunito), `color: theme.colors.text`; `fontWeight`/`fontSize` literais removidos.
- `categoryButtonTextActive`: `color: '#FFFFFF'`; `fontWeight` literal removido.
- `categoryButtonHighContrast`: `backgroundColor: theme.colors.surface2`.
- `categoriesRow`: `gap` migrado para `theme.spacing.sm`.
- Componente `CategoryButton` e a logica de `handleCategoryClick` intactos — apenas valores de estilo mudaram.

### Task 2 — Campo de busca e listCard reestilizados (commit `2070578`)
Estilos `makeStyles` em `src/App.tsx`:
- `searchInput`: `backgroundColor: theme.colors.surface2`, `borderRadius: theme.radii.sm`, `color: theme.colors.text`, espalha `theme.typography.callout` (Nunito); `flex`, `height`, paddings mantidos.
- `searchButton`: `backgroundColor: theme.colors.primary` (era `#007AFF`), `borderRadius: theme.radii.sm`.
- `searchButtonText`: espalha `theme.typography.subheadline`, `color: '#FFFFFF'`.
- `searchClearButton`: `backgroundColor: theme.colors.bgSoft`, `borderRadius: theme.radii.full`.
- `searchClearButtonText`: `color: theme.colors.textMuted`.
- `listCard`: `backgroundColor: theme.colors.bgSoft`, `borderRadius: theme.radii.lg`; `flex: 1` e `overflow: 'hidden'` mantidos.
- JSX: `<ActivityIndicator>` migrado de `color="#5B8C7A"` para `color={theme.colors.primary}` (`theme` em escopo de App desde a linha 427).
- Logica de `handleSearch` / `clearSearchAndClose` e a condicao `isSearchOpen` intactas; `inputHighContrast` preservado verbatim (legado, fora de escopo).

## Deviations from Plan

None — plano executado exatamente como escrito.

## Verification

- `npm run lint` (`tsc --noEmit`): limpo, sem erros.
- `npm run test`: 22/26 passam — 4 falhas pre-existentes de `arasaacService` (baseline aceito), nenhuma falha nova.
- `categoryButtonActive` => `theme.colors.primary`; `categoryButton` => `theme.colors.bgSoft`; `categoryButtonText` => `theme.typography.subheadline`.
- `searchButton` => `theme.colors.primary`; `searchInput` => `theme.colors.surface2`; `listCard` => `theme.colors.bgSoft`.
- `grep "#007AFF"` / `grep "#F2F2F7"` / `grep "color=\"#5B8C7A\""` nas definicoes alteradas => 0 (azul iOS e cinza iOS removidos das categorias, busca e listCard).
- `grep -c "theme.typography" src/App.tsx` => 5 (cresceu em relacao a 23-01 — mais textos com Nunito; VIS-02 avancando).

## Authentication Gates

Nenhum — plano puramente visual, sem rede/auth/persistencia.

## Self-Check: PASSED

- FOUND: src/App.tsx
- FOUND: commit ca67c91 (feat 23-02 reestilizar barra de categorias)
- FOUND: commit 2070578 (feat 23-02 reestilizar campo de busca e listCard)
