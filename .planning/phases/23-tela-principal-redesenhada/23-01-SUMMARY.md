---
phase: 23-tela-principal-redesenhada
plan: 01
subsystem: ui-tela-principal
tags: [visual, header, tema, categoria-cor, nunito]
requires:
  - "src/theme.ts — API de tema Salvia & Creme (fase 22)"
provides:
  - "src/categoryColors.ts — categoryColorFamily: categoria ARASAAC -> cor de familia"
  - "Header da tela principal reestilizado com tokens de tema + fonte Nunito"
affects:
  - "src/App.tsx (header region + makeStyles)"
tech-stack:
  added: []
  patterns:
    - "Tokens theme.colors / theme.typography aplicados aos estilos do header"
    - "Match categoria->cor por token de palavra inteira (evita falso positivo de substring)"
key-files:
  created:
    - src/categoryColors.ts
  modified:
    - src/App.tsx
decisions:
  - "Match categoria->familia por token de palavra inteira em vez de substring crua, para evitar 'acao' casar dentro de 'alimentacao'."
  - "Estilo orfao headerTagline removido (nao mantido) apos a remocao do JSX."
metrics:
  duration: ~2min
  completed: 2026-05-19
  tasks: 2
  files: 2
---

# Phase 23 Plan 01: Tela Principal Redesenhada (Header + Cor de Categoria) Summary

Header da tela principal sem slogan e reestilizado com tokens "Salvia & Creme" + fonte Nunito; novo modulo `src/categoryColors.ts` mapeia categoria ARASAAC para uma de 5 familias de cor suave (+ neutro), pronto para o card da fase 23-03.

## What Was Built

### Task 1 — `src/categoryColors.ts` (commit `13833d4`)
Modulo de funcao pura novo:
- `CATEGORY_COLOR_FAMILIES` — Record `as const` com 6 cores hex: acoes `#DBE6DE`, comida `#F6E6C7`, pessoas `#F0DCCE`, lazer `#E3E8D2`, rotina `#E7E0EC`, neutro `#ECE6D8`.
- `CategoryColorFamily` — tipo derivado das chaves.
- `FAMILY_KEYWORDS` — termos pt-BR (minusculos, sem acento) por familia.
- `normalize` — lowercase + NFD + remocao de diacriticos + trim.
- `tokenize` — quebra texto normalizado em tokens de palavra.
- `categoryColorFamily(category)` — resolve nome de categoria para cor hex; fallback `neutro`.

### Task 2 — Header reestilizado em `src/App.tsx` (commit `b152342`)
- JSX: removido o `<Text style={styles.headerTagline}>Comunicação assistiva</Text>` do `headerTextBlock` no header (anti-padrao "slogan decorativo" do skill). A `introSubtitle` da tela de intro foi preservada intacta (fora de escopo).
- Estilos `makeStyles`: `headerCard`, `title`, `menuButton`, `menuIcon`, `adminBadge`, `adminBadgeOn`, `adminBadgeText`, `searchToggleButton`, `searchToggleButtonActive`, `searchToggleIcon` migrados de literais iOS/legacy para `theme.colors` / `theme.radii`.
- `title` e `adminBadgeText` espalham `theme.typography.*` (`title2` / `caption1`), aplicando a fonte Nunito — fecha parte do gap VIS-02.
- `searchToggleIcon` ganhou `color: theme.colors.primaryInk` (antes so tinha fontSize).
- Estilo orfao `headerTagline` removido.
- Comportamento preservado: `openConfigModal`, LayoutAnimation do toggle de busca, badge ADMIN condicional a `isAdmin` — apenas valores visuais mudaram.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Match categoria->cor casava substring errada**
- **Found during:** Task 1 (verificacao da funcao)
- **Issue:** O plano sugeria casar a familia quando uma keyword fosse substring da entrada. Isso fazia `categoryColorFamily('Alimentação')` retornar `#DBE6DE` (acoes) porque a keyword `acao` e substring de `aliment**acao**` — antes da keyword `comida` ser avaliada.
- **Fix:** Adicionado `tokenize()` que quebra o texto normalizado em tokens de palavra; o match agora exige igualdade exata token == keyword (`tokens.includes(term)`), eliminando o falso positivo de substring. Todas as 6 categorias do `<behavior>` mais `Higiene`/`Escola`/`Lugares` verificadas com retorno correto.
- **Files modified:** src/categoryColors.ts
- **Commit:** `13833d4`

## Verification

- `npm run lint` (`tsc --noEmit`): limpo, sem erros.
- `npm run test`: 22/26 passam — 4 falhas pre-existentes de `arasaacService` (baseline aceito), nenhuma falha nova.
- `grep "headerTagline" src/App.tsx` => 0 (estilo e JSX removidos).
- `grep -c "Comunicação assistiva" src/App.tsx` => 1 (apenas introSubtitle preservada).
- `grep "#007AFF"` no bloco de estilos do header => 0 (azul iOS removido do header; ocorrencias restantes sao estilos fora do escopo deste plano).
- `categoryColorFamily` verificada contra todos os casos do `<behavior>` — todos PASS.

## Authentication Gates

Nenhum — plano puramente visual, sem rede/auth/persistencia.

## Self-Check: PASSED

- FOUND: src/categoryColors.ts
- FOUND: commit 13833d4 (feat 23-01 categoria -> familia de cor)
- FOUND: commit b152342 (feat 23-01 remover slogan e reestilizar header)
