# PLAN - Phase 20 - Config Ajustes iOS + Haptic Feedback

## Objetivo
(1) Atualizar visual do config modal interno para estilo iOS Ajustes (headers UPPERCASE, cards iOS, Switch nativo). (2) Integrar `expo-haptics` em toques principais.

## Requisitos Mapeados
- CFG-01: secoes agrupadas com headers UPPERCASE.
- CFG-02: rows com layout iOS (label + accessory).
- CFG-03: toggles binarios viram Switch nativo.
- FDB-01: haptic feedback em toques principais.

## Escopo

### 1. Criar `src/services/hapticsService.ts`
- Wrapper com API simples: `triggerHaptic('light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error')`.
- Implementacao:
  - light/medium/heavy -> `Haptics.impactAsync(ImpactFeedbackStyle.*)`.
  - success/warning/error -> `Haptics.notificationAsync(NotificationFeedbackType.*)`.
- try/catch silencioso (sem throw).
- Export named.

### 2. Atualizar `modalSectionTitle` style (CFG-01)
- Alterar o estilo de titulo de secao para:
  - `fontSize: 13` (footnote)
  - `fontWeight: '500'`
  - `color: colors.secondaryLabel`
  - `letterSpacing: 0.5`
  - `textTransform: 'uppercase'`
  - `paddingHorizontal: 16`
  - `paddingTop: 16`
  - `paddingBottom: 6`

### 3. Atualizar `configSectionCard` (CFG-01)
- Alterar estilo para:
  - `backgroundColor: colors.secondarySystemGroupedBackground`
  - `borderRadius: radii.lg` (16)
  - `borderWidth: 0`
  - `padding: spacing.lg`
  - `...shadows.sm`
- Remover border atual se houver.

### 4. Substituir OptionChips binarios por Switch (CFG-03)
- **Contraste** (linha ~2689):
  - Atual: `<OptionChip label="Padrão" ... />` + `<OptionChip label="Alto" ... />`.
  - Novo: `<View flexDirection="row" alignItems="center" justifyContent="space-between">` com `<Text>Alto contraste</Text>` + `<Switch value={contrastMode === 'alto'} onValueChange={v => setContrastMode(v ? 'alto' : 'padrao')} trackColor={{false: colors.systemGray4, true: colors.systemBlue}} thumbColor="#FFFFFF" />`.
- **Feedback visual** (linha ~2694):
  - Atual: `<OptionChip label="Ativado" ... />` + `<OptionChip label="Reduzido" ... />`.
  - Novo: idem com Switch vinculado a `visualFeedbackEnabled`.
- Preservar labels pt-BR e handlers.

### 5. Atualizar ConfigNavItem visual (CFG-02)
- Active: bg `colors.systemBlue`, texto `#FFFFFF` peso 600.
- Inactive: bg `colors.secondaryFill`, texto `colors.label` peso 500.
- Border `radii.md`, padding vertical 10 horizontal 14.

### 6. Integrar haptics (FDB-01)
Instrumentar os seguintes handlers/press events com `triggerHaptic`:

| Handler | Intensidade | Fonte do call |
|---------|-------------|---------------|
| Tap em simbolo da grade (add ao composer) | light | Pressable onPress que adiciona simbolo |
| Tap em core vocab button | light | `coreVocabButton` onPress |
| Tap em frase pronta | light | Em phrase list press |
| Tap em historico de frase | light | Em history list press |
| Toggle passo de rotina | success | `toggleRoutineStep` |
| Tap em "Gerar" (IA) | medium | `handleGenerate` inicio |
| Tap em "Ouvir" | light | `handlePlay` inicio |
| Tap em "Salvar grupo" | success | `confirmSaveCustomSymbol` |
| Tap em "Salvar simbolo pessoal" | success | `savePendingSymbol` inicio |
| Tap em "Salvar voz" | success | `attachRecordedAudioToSymbol` inicio |
| Tap em "Deletar" (composer) | warning | `clearSymbols` |

Import: `import { triggerHaptic } from './services/hapticsService';`

### Alto contraste
- Verificar se Switch em alto contraste permanece legivel; se necessario, condicional `trackColor` diferente. Provavelmente o default iOS esta bom.

### Nao altera
- Logica de navegacao do config (ConfigNavItem + configSection state).
- Handlers de dados (AsyncStorage, services).
- Estrutura de secoes.
- OptionChips com 3+ valores (UI scale, rate, pitch) permanecem.

## Fora de Escopo
- Reescrita completa do config como IOSListSection (deferido — custo/beneficio).
- Chevrons navegaveis (nao aplicavel — config nao navega para telas).
- Dark mode.
- Select haptic (scroll/swipe).

## Arquivos Alvo
- `src/services/hapticsService.ts` (novo).
- `src/App.tsx` (Switch refactor + haptics imports/calls + style tweaks).

## Plano de Implementacao

1. **Criar hapticsService**: 60 linhas, API simples.
2. **Importar em App.tsx**.
3. **Style tweaks** em `modalSectionTitle` e `configSectionCard`.
4. **Switch refactor**: 2 lugares (contraste, feedback visual).
5. **ConfigNavItem**: atualizar estilo.
6. **Haptics**: adicionar calls em cada handler listado na tabela.
7. **Smoke**:
   - `npm run lint`.
   - `npm run test -- --runInBand`.
   - `npm run start` — testar toques e ouvir vibracoes (opcional em simulador).

## Criterios de Aceite (UAT)
1. Titulos de secao do config sao UPPERCASE em caixa pequena.
2. Cards de secao tem bg iOS e shadow sutil.
3. Alto contraste e Feedback visual usam Switch nativo iOS (trackColor systemBlue).
4. Nav items active/inactive tem visual iOS (systemBlue / secondaryFill).
5. Toques principais disparam haptic feedback (validacao em device real ou manual via log).
6. Preferencias continuam persistindo.
7. `npm run lint` limpo; test suite sem regressao.

## Verificacao
- Automatizada: `npm run lint`, `npm run test -- --runInBand`.
- Manual: abrir config, alternar toggles, ver Switch responde; em device, sentir haptics em taps principais.

## Riscos
- `Switch` em `react-native` tem algumas quirks Android — pode ter lag de sync; usar `onValueChange` (nao `onChange`).
- `expo-haptics` em Expo Go funciona diretamente; em prod build precisa prebuild. Nao bloqueia Phase 20.
- Haptics excessivos irritam usuarios — restringir a pontos claros de interacao conforme tabela.

## Mitigacoes
- Test manual em Expo Go.
- Usar intensidade Light como default; medium/heavy/success/warning/error apenas em acoes especificas.

## Dependencias
- Depends on: Phase 17 (expo-haptics instalado, tokens).
- Desbloqueia: Phase 21.
