# MILESTONE ARCHIVE - v5

## Milestone
- Nome: Milestone 5 - Refatoracao de Design no Estilo iOS
- Status: shipped
- Data conclusao: 2026-04-21

## Scope
- Refatorar aparencia do Fala Mobile para idioma visual iOS (iPhone).
- Preservar 100% da funcionalidade entregue nas milestones v1-v4.
- Restricao dura: simplicidade sobre riqueza de features (publico autista).
- Escopo exclusivamente visual/UX — nenhum requisito funcional novo.

## Phases

### Phase 17 - Design System iOS (Tokens e Primitivos)
- Objetivo: estabelecer o design system iOS (tokens de cor, tipografia, espacamento, raios, sombras) e componentes primitivos reutilizaveis.
- Entregas:
  - `src/theme.ts` expandido com tokens iOS: `colors`, `typography` (largeTitle..caption2), `radii`, `spacing`, `shadows`.
  - `src/ui/` com 6 primitivos: IOSButton (filled/tinted/plain), IOSCard, IOSSectionHeader, IOSListSection, IOSListRow, IOSBottomSheet.
  - `expo-haptics` e `expo-blur` instalados com plugins em `app.json`.
  - Header adotado como POC dos tokens.
- Requisitos: DS-01, DS-02, DS-03.
- Status: Complete.

### Phase 18 - Tela Principal estilo iOS
- Objetivo: refatorar header, categorias, busca, grid e composer para estetica iOS.
- Entregas:
  - Header com hairline separator e tokens.
  - Categorias em pills/segmented iOS (systemBlue active / secondaryFill inactive).
  - Search field bg `systemGray6` + botao clear circular.
  - SymbolCard com raio 14, `shadows.sm`, favorite overlay circular.
  - Composer card `secondarySystemGroupedBackground` + `shadows.sm`.
  - Botoes do composer em variantes iOS (filled/tinted/plain).
- Depends on: Phase 17.
- Requisitos: MAIN-01, MAIN-02, MAIN-03, MAIN-04, MAIN-05.
- Status: Complete.

### Phase 19 - Sheets e Modais iOS
- Objetivo: substituir Modal tradicionais por bottom sheets iOS com BlurView backdrop.
- Entregas:
  - IOSBottomSheet atualizado com BlurView + overlay dismiss.
  - 4 modais migrados: naming group, audio recorder, symbol draft, config shell.
  - Header Cancelar/Pronto estilo iOS; grabber + safe-area bottom.
- Depends on: Phase 17.
- Requisitos: SHEET-01, SHEET-02, SHEET-03.
- Status: Complete.

### Phase 20 - Config "Ajustes" iOS + Haptic Feedback
- Objetivo: visual iOS para config + Switch nativo + haptics.
- Entregas:
  - `src/services/hapticsService.ts` com triggerHaptic (6 intensidades).
  - Section headers UPPERCASE footnote, cards iOS.
  - Switch nativo para "alto contraste" e "feedback visual".
  - configNavItem visual iOS active/inactive.
  - Haptics em 7 pontos: addSymbol, handlePlay, handleGenerate, toggleRoutineStep, clearSymbols, confirmSaveCustomSymbol, savePendingSymbol, attachRecordedAudioToSymbol.
- Depends on: Phases 17, 19.
- Requisitos: CFG-01, CFG-02, CFG-03, FDB-01.
- Status: Complete.

### Phase 21 - Regressao, Polimento e Release
- Objetivo: regressao completa e preparacao de entrega.
- Entregas:
  - `npm run lint` limpo.
  - `npm run test -- --runInBand` 22/26 (4 pre-existentes herdados no arasaacService — aceitos).
  - RELEASE-CHECKLIST.md atualizado com secao v5.
  - Cleanup de estilos legacy deferido para milestone futura.
- Depends on: Phases 18, 19, 20.
- Requisitos: REG-01.
- Status: Complete.

## Outcome
- 16/16 requisitos entregues.
- 5/5 phases completas.
- Regressao automatizada OK; validacao manual em device listada em RELEASE-CHECKLIST.md.
- Arquivos criados: `src/theme.ts` (expandido), `src/ui/*` (8 arquivos), `src/services/hapticsService.ts`.
- Arquivos alterados: `src/App.tsx`, `app.json`, `package.json`.
