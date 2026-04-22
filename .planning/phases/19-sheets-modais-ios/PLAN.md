# PLAN - Phase 19 - Sheets e Modais iOS

## Objetivo
Substituir 4 `Modal` tradicionais em `src/App.tsx` por `IOSBottomSheet` com grabber, blur backdrop (expo-blur) e header iOS. Atualizar `IOSBottomSheet` para usar BlurView no backdrop.

## Requisitos Mapeados
- SHEET-01: bottom sheets com grabber visivel, safe-area bottom.
- SHEET-02: blur backdrop via expo-blur.
- SHEET-03: header Cancelar/Pronto estilo iOS.

## Escopo

### Atualizar `IOSBottomSheet.tsx`
- Trocar o overlay `rgba(0,0,0,0.4)` por `BlurView` (`expo-blur`) com `intensity={70}`, `tint="default"`, cobrindo fullscreen (`StyleSheet.absoluteFillObject`).
- Adicionar overlay sutil `rgba(0,0,0,0.15)` por cima do BlurView para garantir contraste mesmo em backgrounds claros.
- Tap no BlurView/overlay continua disparando `onRequestClose`.

### Refatorar `src/App.tsx`

1. **Naming group modal** (linhas ~1930):
   - Substituir `<Modal>...<View style={styles.modalBackdrop}>...<View style={styles.modalCard}>` por `<IOSBottomSheet visible={isNamingModalOpen} onRequestClose={...} title="Salvar grupo" leftAction={{label: 'Cancelar', onPress: () => setIsNamingModalOpen(false)}} rightAction={{label: 'Salvar', onPress: confirmSaveCustomSymbol, bold: true}}>`.
   - Conteudo: `<TextInput>` com estilo mantido (ou atualizado para estilo iOS).
   - Remover `<View style={styles.modalActions}>` e botoes — agora vao no header via leftAction/rightAction.

2. **Audio recorder modal** (linhas ~1953):
   - Substituir por `<IOSBottomSheet>` com title "Gravar voz", leftAction Cancelar, rightAction "Salvar voz" bold + disabled=!draftAudioUri.
   - Conteudo: hint + AudioRecorderControls.

3. **Symbol draft modal** (linhas ~1988):
   - Substituir por `<IOSBottomSheet>` com title "Novo simbolo", leftAction Cancelar, rightAction "Salvar" bold.
   - Conteudo: preview image + TextInput (label) + AudioRecorderControls + category chips.
   - maxHeightPct 0.85 (default).

4. **Config modal shell** (linhas ~2060):
   - Substituir so o wrapper: `<Modal>` -> `<IOSBottomSheet visible={isConfigModalOpen} onRequestClose={...} title="Ajustes" leftAction={{label: 'Fechar', onPress: () => {setIsConfigModalOpen(false); resetConfigFields();}}}>`.
   - Conteudo interno (`<View style={styles.configSheet}>` e todo o conteudo de config sections) permanece. Remover `configHeader` duplicado interno (ja temos o header do IOSBottomSheet).
   - **NAO** trocar ainda: rows, switches, inset grouped — isso e Phase 20.

### Limpeza condicional
- Estilos obsoletos apos migracao (`modalBackdrop`, `modalCard`, `modalCardHighContrast`, `modalTitle`, `modalActions`, `modalButtonLight`, `modalButtonPrimary`, `modalButtonPrimaryText`, `modalInput` se so usado em modais, `symbolDraftCard`, `modalHint`) — marcar como candidatos a remocao em Phase 21; nao remover agora para evitar impacto em referencias ainda existentes.

## Fora de Escopo
- Reformulacao interna do config (Phase 20).
- Haptics (Phase 20).
- Animacoes spring / detents.
- Troca do `Modal` host para libs externas (react-native-reanimated bottom sheet).
- Remover estilos legacy de modal (cleanup fica para Phase 21).

## Arquivos Alvo
- `src/ui/IOSBottomSheet.tsx` (adicionar BlurView).
- `src/App.tsx` (substituir 4 modais).

## Plano de Implementacao

1. **Atualizar `IOSBottomSheet`**:
   - `import { BlurView } from 'expo-blur';`
   - Trocar o Pressable backdrop por layout: BlurView absolutamente posicionado + Pressable absolutamente posicionado com overlay `rgba(0,0,0,0.15)` transparente por cima (para capturar tap).
   - Garantir tap chama `onRequestClose`.

2. **Importar `IOSBottomSheet` em `App.tsx`** — adicionar ao import de `./ui` se ainda nao tiver.

3. **Refatorar naming group modal**:
   - Substituir bloco Modal inteiro por IOSBottomSheet com title, leftAction, rightAction.
   - Dentro, preservar TextInput; remover modalActions.

4. **Refatorar audio recorder modal**: idem, com AudioRecorderControls dentro e rightAction disabled=!draftAudioUri.

5. **Refatorar symbol draft modal**: idem, com todo o conteudo (preview, TextInput, audio, category chips) dentro. ScrollView interno se necessario para conteudo longo.

6. **Refatorar config modal shell**: trocar `<Modal>...<View style={styles.modalBackdrop}>` por `<IOSBottomSheet>`; remover configHeader que dupe o header do sheet.

7. **Testar**:
   - `npm run lint` limpo.
   - `npm run test -- --runInBand` sem novas falhas.
   - `npm run start` — abrir cada sheet e validar: grabber visivel, blur backdrop, Cancelar/Salvar funcionando.

8. **Fechamento**: STATE.md, ROADMAP Progress, SUMMARY.md.

## Criterios de Aceite (UAT)
1. Todos os 4 modais abrem como bottom sheet ancorado no bottom com grabber visivel.
2. Backdrop e desfocado (BlurView) em vez de overlay solido.
3. Tap em "Cancelar" descarta/fecha sem persistir; tap em "Salvar"/"Pronto" persiste.
4. Sheets respeitam safe-area bottom.
5. Fluxos continuam funcionais: salvar grupo, gravar voz, criar simbolo pessoal, abrir config.
6. `npm run lint` limpo; test suite sem regressao.

## Verificacao
- Automatizada: `npm run lint`, `npm run test -- --runInBand`.
- Manual: abrir cada sheet, validar visual (grabber, blur), testar Cancelar/Salvar, confirmar que sheets fecham corretamente.

## Riscos
- `BlurView` pode ter comportamento diferente em Android vs iOS; fallback no overlay garante legibilidade.
- Config modal e longo; o IOSBottomSheet precisa ter ScrollView interno ou deixar o conteudo lidar com scroll. A implementacao atual de IOSBottomSheet usa `View` como content container — pode precisar substituir por ScrollView para config.
- Sheets com teclado: RN Modal com keyboard pode ter comportamento de offset diferente — validar em dispositivo real.

## Mitigacoes
- Testar em iOS e Android.
- Se config precisar scroll, adicionar ScrollView inline dentro do IOSBottomSheet (o content prop ja e ReactNode, nao precisa primitivo mudar).
- KeyboardAvoidingView envolvendo os TextInputs se necessario.

## Dependencias
- Depends on: Phase 17 (IOSBottomSheet + expo-blur instalado).
- Desbloqueia: Phase 21.
