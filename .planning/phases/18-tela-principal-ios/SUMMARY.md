# SUMMARY - Phase 18 - Tela Principal estilo iOS

**Status:** Complete
**Data:** 2026-04-21

## Entregas

### Header (MAIN-01)
- `headerCard` trocou de border+padding custom para nav-bar iOS: sem borda, hairline `separator` na base, padding `spacing.lg/md`.
- `adminBadge` vira pill arredondada (`radii.pill` 999) com bg `colors.fill` e texto em `colors.systemBlue`.

### Categorias (MAIN-02)
- `categoryButton` inativo: bg `colors.secondaryFill`, padding 14/7, minHeight 32, texto `colors.label` peso 500.
- `categoryButtonActive`: bg `colors.systemBlue`, texto branco peso 600.
- Visual agora claramente iOS segmented/pills.

### Search field (MAIN-03)
- `searchInput`: bg `colors.systemGray6`, `borderRadius: 10`, sem borda, texto `colors.label`.
- `searchClearButton` vira circulo (`borderRadius: 17`) em `colors.systemGray4`, texto branco.
- `searchButton` usa `colors.systemBlue`.

### SymbolCard (MAIN-04)
- `symbolCard`: `borderRadius: 14`, `shadows.sm` (substituindo border 2px), bg `colors.systemBackground`.
- `favoriteButton` vira estrela circular (`32x32`, `borderRadius: 16`) com bg branco e `shadows.sm`; icone `colors.warning` (dourado) para estado ativo.
- `listCard`: bg `secondarySystemBackground`, sem borda.

### Core vocab bar (MAIN-04 rel)
- `coreVocabBar`: bg `colors.secondaryFill`, sem borda (mantem `radii 14`).
- `coreVocabButton`: bg `colors.systemBlue` (antes verde custom), texto branco peso 600.

### Composer (MAIN-05)
- `composerCard`: bg `colors.secondarySystemGroupedBackground`, `borderRadius: 16`, `shadows.sm`, sem borda.
- Botoes refatorados visualmente para variantes iOS (mantendo estrutura existente com icone + label):
  - `generateButton` e `playButton`: **filled** — `systemBlue` bg + texto branco peso 600.
  - `saveGroupButton`: **tinted** — `colors.fill` bg + texto `systemBlue` peso 500.
  - `clearButton`: **plain destructive** — transparente + texto `colors.destructive`.
- Labels continuam em pt-BR (Gerar, Ouvir, Salvar, Deletar).
- Removido `textTransform: uppercase` para alinhamento iOS (tipografia title case).

### Preservado
- Todos os handlers (`handleGenerate`, `handlePlay`, `clearSymbols`, `saveCustomSymbol`).
- `contrastMode === 'alto'` continua aplicando overrides nos blocos onde ha bifurcacao.
- `uiScaleFactor` em textos.
- Estrutura JSX (nenhum componente extraido).

## Arquivos Alterados
- `src/App.tsx` (imports, StyleSheet entries — nenhum mudanca em render JSX exceto tokens no import).

## Validacao

- `npm run lint` — **PASS** (tsc --noEmit limpo).
- `npm run test -- --runInBand` — 22 passing, 4 pre-existing failures (arasaacService network — inherited).
- Sem regressoes.

## Decisoes

- **Botoes do composer nao foram substituidos por `IOSButton`**; em vez disso, os estilos custom foram refatorados para o visual iOS. Motivo: os botoes atuais tem layout icone+label empilhados que nao combinam com a prop `icon` do `IOSButton` (inline). Substituir exigiria restructuring do JSX e risco maior de regressao. Visualmente atingem os mesmos criterios iOS (filled/tinted/plain, `systemBlue`, cantos `radii.md`).
- **`IOSChip` nao foi criado** — chips inline servem. Deferido conforme CONTEXT.md.
- **`radii` literal 14px** usado no SymbolCard (entre `md 12` e `lg 16`) — valor especifico iOS para cards de tile.
- **Favoritos usam `colors.warning` (#FF9500 amarelo-laranja)** para estrela visivel. Poderia ser um dourado custom, mas warning ja cumpre bem visualmente.

## Gotchas para Phase 19/20/21

1. **Header agora tem hairline bottom** — em Phase 19 (sheets) e Phase 20 (config), manter a consistencia desse separator pattern.
2. **`composerCard` fundo e `secondarySystemGroupedBackground`** — em Phase 20 (config), usar o mesmo padrao quando aplicavel.
3. **`searchInput` e bg `systemGray6`** — qualquer novo search field deve usar o mesmo token.
4. **Botoes do composer usam estilos inline, nao `IOSButton`** — Phase 20 usa `IOSButton` em outros contextos; documentado aqui como dual-path aceito.
5. **Alto contraste** continua via overrides em `isHighContrast && styles.xxx`; verificar visualmente em Phase 21.

## Dependencias

- **Depends on:** Phase 17 (tokens).
- **Desbloqueia:** Phase 21 (regressao).
- **Nao depende:** Phase 19 (sheets) e Phase 20 (config) — pode-se trabalhar em paralelo.

## Progress

- Phase 18 1/1 plan complete.
