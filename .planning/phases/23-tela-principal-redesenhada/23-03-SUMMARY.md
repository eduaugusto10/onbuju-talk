---
phase: 23-tela-principal-redesenhada
plan: 03
subsystem: ui-tela-principal
tags: [visual, card-pictograma, vocabulario-core, tema, nunito, categoryColors]
requires:
  - "src/theme.ts — API de tema Salvia & Creme (fase 22)"
  - "src/categoryColors.ts — categoryColorFamily (fase 23-01)"
  - "23-02 — barra de categorias / busca / listCard reestilizados"
provides:
  - "SymbolCard com tile de cor de categoria atras do pictograma"
  - "Estrela de favorito como overlay circular no canto do card"
  - "Vocabulario core integrado como primeira linha fixa da grade (ListHeaderComponent)"
  - "Estado vazio da grade tokenizado em theme.typography (Nunito)"
affects:
  - "src/App.tsx (SymbolCard; FlatList da grade normal; makeStyles — symbolCard/Tile/Label, favoriteButton, emptyText, audioBadge, coreVocab*)"
tech-stack:
  added: []
  patterns:
    - "Tile de cor de categoria: View arredondado com backgroundColor inline (categoryColorFamily) envolvendo o CachedImage"
    - "Vocabulario core como ListHeaderComponent da grade — nao como barra separada"
    - "Tokens theme.colors / theme.radii / theme.shadows / theme.typography aplicados ao card e ao estado vazio"
key-files:
  created: []
  modified:
    - src/App.tsx
decisions:
  - "Tile do pictograma com raio fixo (18/14/12 por densidade) — mais arredondado que o card (theme.radii.md=16) para o efeito 'tapete' do sketch 002 variante D."
  - "favoriteButtonActive mantido como style separado (mesmo backgroundColor surface) — preserva a assinatura do array de estilo do JSX sem refatorar o componente."
  - "Estilos coreVocabBar* e variantes high-contrast removidos — barra separada eliminada (anti-padrao do skill); high-contrast do core agora coberto pelo tema sereno-escuro."
metrics:
  duration: ~6min
  completed: 2026-05-19
  tasks: 2
  files: 1
---

# Phase 23 Plan 03: Tela Principal Redesenhada (Card de Pictograma + Vocabulario Core) Summary

`SymbolCard` refeito no estilo validado (sketch 002 variante D): card limpo em superficie quente com a cor da categoria preenchendo um tile arredondado ATRAS do pictograma, rotulo como texto simples abaixo, estrela de favorito como overlay circular no canto. O vocabulario core deixou de ser uma barra separada e passou a ser a primeira linha fixa da grade via `ListHeaderComponent`, preservando a funcao da Phase 12 (v4) sem competir visualmente. Estado vazio da grade tokenizado em Nunito — avancando o fechamento do gap VIS-02.

## What Was Built

### Task 1 — SymbolCard com tile de cor de categoria + estado vazio tokenizado (commit `ff7f087`)
Em `src/App.tsx`:
- Novo import `categoryColorFamily` de `./categoryColors`.
- `SymbolCard`: calcula `const tileColor = categoryColorFamily(item.category)`; o `<CachedImage>` agora vive dentro de um `<View>` `symbolTile` com `backgroundColor: tileColor` inline. `audioBadge` e `favoriteButton` permanecem como overlays absolutos do card.
- Estilos `makeStyles`:
  - `symbolCard`: `backgroundColor: theme.colors.surface`, `borderRadius: theme.radii.md`, `borderWidth: 1`, `borderColor: theme.colors.border`, `...theme.shadows.sm`.
  - Novos `symbolTile` (96x96, raio 18), `symbolTileDense` (60x60, raio 14), `symbolTileUltraDense` (46x46, raio 12).
  - `favoriteButton`: `position: 'absolute', top: 6, right: 6, zIndex: 2`, `borderRadius: theme.radii.full`, `backgroundColor: theme.colors.surface`, `...theme.shadows.sm` (removido `alignSelf: 'flex-end'`).
  - `favoriteButtonText`: `color: theme.colors.star`.
  - `symbolLabel`: espalha `theme.typography.subheadline` (Nunito), `color: theme.colors.text` (removido `fontWeight`/`fontSize` literais; `symbolLabelDense` mantem `fontSize: 12`).
  - `emptyText`: espalha `theme.typography.callout` (Nunito), `color: theme.colors.textMuted` (era `#64748b`).
  - `audioBadge`: `backgroundColor: theme.colors.primary`.
- Props e comportamento de `SymbolCard` intactos; favorito ainda so aparece com `isAdmin`. Textos pt-BR e logica do `ListEmptyComponent` inalterados.

### Task 2 — Vocabulario core como primeira linha fixa da grade (commit `6695e3d`)
Em `src/App.tsx`:
- Removido o bloco JSX da barra de vocabulario core separada (`<View style={styles.coreVocabBar}>` + ScrollView + map).
- FlatList da grade normal (`data={symbolsToRender}`) recebeu `ListHeaderComponent`: um `<ScrollView horizontal>` com os `coreVocabButton` (chama `addCoreWord`), renderizado somente quando `activeCategory` nao for scenes/routine e `coreVocabulary.length > 0`. `accessibilityRole`/`accessibilityLabel` preservados.
- Estilos `makeStyles`:
  - `coreVocabRow`: mantem `flexDirection: 'row'` + `gap`; adiciona `paddingHorizontal`/`paddingBottom: theme.spacing.sm`.
  - `coreVocabButton`: `backgroundColor: theme.colors.primarySoft`, `borderRadius: theme.radii.full`.
  - `coreVocabButtonText`: espalha `theme.typography.caption1` (Nunito), `letterSpacing: 0.3`, `color: theme.colors.primaryInk`.
  - Removidos os estilos orfaos `coreVocabBar`, `coreVocabBarHighContrast`, `coreVocabButtonHighContrast`, `coreVocabButtonTextHighContrast` (0 referencias no JSX).
- Override de escala inline `{ fontSize: 14 * uiScaleFactor }` mantido no texto do header.
- Editor de vocabulario core da config (`configSection 'vocabulario'`) NAO tocado — escopo da fase 24.

## Deviations from Plan

None — plano executado exatamente como escrito.

## Verification

- `npm run lint` (`tsc --noEmit`): limpo, sem erros.
- `npm run test`: 22/26 passam — 4 falhas pre-existentes de `arasaacService` (baseline aceito), nenhuma falha nova.
- `grep "import { categoryColorFamily }" src/App.tsx` => 1.
- `grep "categoryColorFamily(item.category)" src/App.tsx` => 1.
- `grep "symbolTile:" src/App.tsx` => 1.
- `grep "styles.coreVocabBar" src/App.tsx` => 0 (barra separada removida).
- `grep "ListHeaderComponent" src/App.tsx` => 1.
- `grep "addCoreWord(word)" src/App.tsx` => 1 (vocabulario core ainda funcional).
- `symbolCard` => `theme.colors.surface`; `favoriteButton` => `position: 'absolute'`; `symbolLabel` e `emptyText` => `theme.typography`; `coreVocabButton` => `theme.colors.primarySoft`; `coreVocabButtonText` => `theme.typography.caption1`.

## Authentication Gates

Nenhum — plano puramente visual, sem rede/auth/persistencia.

## Self-Check: PASSED

- FOUND: src/App.tsx
- FOUND: commit ff7f087 (feat 23-03 refazer SymbolCard com tile de cor de categoria)
- FOUND: commit 6695e3d (feat 23-03 integrar vocabulario core como primeira linha fixa da grade)
