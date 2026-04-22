# SUMMARY - Phase 19 - Sheets e Modais iOS

**Status:** Complete
**Data:** 2026-04-21

## Entregas

### `IOSBottomSheet` upgrade (src/ui/IOSBottomSheet.tsx)
- Backdrop agora usa `BlurView` de `expo-blur` (`intensity={70}`, `tint="default"`) cobrindo fullscreen.
- Pressable overlay semi-transparente (rgba 0,0,0,0.15) posicionado por cima do BlurView captura o tap de dismiss.
- Fallback: se BlurView nao montar (Android antigo, erro de nativo), o overlay continua visivel garantindo dismiss.
- Grabber, safe-area inset, header com left/right actions permanecem inalterados.

### 4 Modais refatorados para IOSBottomSheet (src/App.tsx)

1. **Naming group modal** ("Salvar grupo")
   - Title: "Salvar grupo".
   - leftAction: Cancelar.
   - rightAction: Salvar (bold).
   - Conteudo: TextInput para nome do grupo.

2. **Audio recorder modal** ("Gravar voz")
   - Title: "Gravar voz".
   - leftAction: Cancelar.
   - rightAction: "Salvar voz" (bold, disabled=!draftAudioUri).
   - Conteudo: hint + AudioRecorderControls.

3. **Symbol draft modal** ("Novo simbolo")
   - Title: "Novo simbolo".
   - leftAction: Cancelar.
   - rightAction: Salvar (bold).
   - Conteudo: ScrollView com preview + label input + audio controls + category chips.
   - placeholderTextColor migrado para `colors.tertiaryLabel`.

4. **Config modal shell** ("Ajustes")
   - Title: "Ajustes".
   - leftAction: "Fechar" (fecha + resetConfigFields).
   - sem rightAction (config nao tem acao primaria singular).
   - `configHeader` interno removido — subheader curto com admin status permanece.
   - **Conteudo interno das sections permanece inalterado** — Phase 20 reformula como inset grouped list.

### Novos estilos
- `sheetContent`: padding horizontal/vertical padrao para conteudo de sheet.
- `sheetScrollContent`: flexGrow/flexShrink para ScrollView dentro de sheet.
- `configSubheader`: padding para o subheader do config (acima do nav).

## Arquivos Alterados
- `src/ui/IOSBottomSheet.tsx` (BlurView integration).
- `src/App.tsx` (4 modals -> 4 IOSBottomSheet; novos styles).

## Validacao

- `npm run lint` — **PASS** (tsc --noEmit limpo).
- `npm run test -- --runInBand` — 22 passing, 4 pre-existing failures (arasaacService network — inherited).
- Sem regressoes.

## Decisoes

- **BlurView `tint="default"`** — adapta ao userInterfaceStyle do app (que ja e "light" em app.json). Pode evoluir para "light"/"dark" quando o dark mode for introduzido.
- **Pressable overlay com alpha 0.15** por cima do BlurView — garante contraste em backgrounds claros mesmo com blur ativo.
- **Config header duplicado removido** — manter so o header do IOSBottomSheet evita duas barras titulares; subheader curto mantido para mostrar status admin.
- **Estilos legacy de modal** (`modalBackdrop`, `modalCard`, `modalTitle`, `modalActions`, `modalButtonLight`, `modalButtonPrimary`, `modalCardHighContrast`, `modalInput`, `modalHint`, `symbolDraftCard`) NAO removidos nesta fase — continuam referenciados por alguns layouts. Cleanup em Phase 21.

## Gotchas para Phase 20/21

1. **Config modal agora e IOSBottomSheet** — Phase 20 reformula o conteudo interno (secoes) para inset grouped list + switches + haptics sem mexer no shell.
2. **`sheetContent` style** e padrao para padding interno — reutilizar quando adicionar conteudo novo em qualquer sheet.
3. **ScrollView no symbol draft sheet** — sheets com conteudo longo precisam de ScrollView interno (naming e audio sheets nao precisam, sao curtos).
4. **BlurView em Android** — visual pode ser menos pronunciado; em nosso caso, a alpha overlay garante legibilidade. Validar em dispositivo Android real na Phase 21.
5. **`configHeader` / `configCloseButton` / `configCloseIcon` styles** — ficam no StyleSheet mas nao sao mais usados pelo config shell; Phase 21 pode remover.

## Dependencias

- **Depends on:** Phase 17 (IOSBottomSheet + expo-blur).
- **Desbloqueia:** Phase 20 (config interna), Phase 21.
- **Paralelo:** Phase 18 (tela principal) — independente.

## Progress

- Phase 19 1/1 plan complete.
