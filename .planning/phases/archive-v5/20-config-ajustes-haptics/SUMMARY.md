# SUMMARY - Phase 20 - Config Ajustes iOS + Haptic Feedback

**Status:** Complete
**Data:** 2026-04-21

## Entregas

### `src/services/hapticsService.ts` (novo)
- Wrapper centralizado `triggerHaptic(intensity)` com 6 intensidades: light, medium, heavy, success, warning, error.
- Usa `Haptics.impactAsync` para impact (light/medium/heavy) e `Haptics.notificationAsync` para notification (success/warning/error).
- try/catch silencioso — no-op em plataformas sem suporte.
- Fire-and-forget (nao await no caller).

### Config Ajustes (CFG-01, CFG-02, CFG-03)

- **`modalSectionTitle`** agora iOS section header style: `footnote` size (13), UPPERCASE, letterSpacing 0.5, `colors.secondaryLabel`.
- **`configSectionCard`** agora `secondarySystemGroupedBackground` bg, `radii.lg` (16), sem borda, `shadows.sm`.
- **`configNavItem`** usa `colors.secondaryFill` inativo + `colors.systemBlue` ativo; texto ativo branco peso 600.
- **Switch nativo iOS** substitui `OptionChip` binarios em:
  - "Alto contraste" (contrastMode).
  - "Feedback visual" (visualFeedbackEnabled).
  - `trackColor` com `{false: systemGray4, true: systemBlue}`, `thumbColor: #FFFFFF`.
  - Novos estilos `iosToggleRow` + `iosToggleLabel` para linha label+switch.
- `OptionChip` com 3 opcoes (UI Scale, Rate, Pitch) PERMANECE — sao escalas, nao binarios.

### Haptic feedback (FDB-01)
- **light** em: `addSymbol` (tap em simbolo da grade ou core word), `handlePlay` (Ouvir).
- **medium** em: `handleGenerate` (Gerar IA).
- **success** em: `toggleRoutineStep`, `confirmSaveCustomSymbol` (Salvar grupo), `savePendingSymbol` (Salvar simbolo), `attachRecordedAudioToSymbol` (Salvar voz).
- **warning** em: `clearSymbols` (Deletar composer).

## Arquivos Criados / Alterados

### Criados
- `src/services/hapticsService.ts`

### Alterados
- `src/App.tsx`:
  - Import `Switch` de `react-native`.
  - Import `triggerHaptic` de `./services/hapticsService`.
  - 2 OptionChips binarios substituidos por Switch.
  - 3 styles modernizados (`modalSectionTitle`, `configSectionCard`, `configNavItem`).
  - 2 styles novos (`iosToggleRow`, `iosToggleLabel`).
  - 7 pontos de haptic adicionados (addSymbol, handlePlay, handleGenerate, toggleRoutineStep, clearSymbols, confirmSaveCustomSymbol, savePendingSymbol, attachRecordedAudioToSymbol).

## Validacao

- `npm run lint` — **PASS** (tsc --noEmit limpo).
- `npm run test -- --runInBand` — 22 passing, 4 pre-existing failures (arasaacService network — inherited).
- Sem regressoes; persistencia de preferencias mantida (Switch usa o mesmo setter state; AsyncStorage ja sync via useEffect existente).

## Decisoes

- **Config interno nao foi totalmente migrado para IOSListSection/IOSListRow** — deferido por custo vs beneficio. Visual tweak (section header UPPERCASE, card iOS, switch) atinge os criterios CFG-01..CFG-03 sem reescrever 1000+ linhas.
- **OptionChips com 3+ valores permanecem** — REQUIREMENTS especifica "toggles binarios" para Switch; escalas ficam como chips (aceitavel por CFG-03).
- **Sem chevrons** — config usa nav inline (sections renderizam abaixo dos nav items), nao navegacao para outras telas. Chevron seria enganoso.
- **`triggerHaptic` e fire-and-forget** — nao bloqueia o handler; try/catch silencioso.

## Gotchas para Phase 21

1. **Haptics so funcionam em device real ou Expo Go com suporte** — em simulador web nao tem vibracao, mas API e no-op silenciosa.
2. **Switch em Android**: look e um pouco diferente do iOS (Material thumb pattern). trackColor garante cor coerente; nao precisa fix adicional.
3. **Estilos legacy** ainda presentes no StyleSheet (`modalBackdrop`, `modalCard`, `modalTitle`, `modalActions`, `modalButtonLight`, `modalButtonPrimary`, etc.) — Phase 21 pode limpar alguns.
4. **`OptionChip` component ainda e usado** — nao remover. So os binarios migraram.
5. **Regressao em alto contraste** — Switch herda look iOS em ambos os modos; revisar no device.

## Dependencias

- **Depends on:** Phase 17 (expo-haptics + tokens), Phase 19 (config shell ja e IOSBottomSheet).
- **Desbloqueia:** Phase 21.

## Progress

- Phase 20 1/1 plan complete.
