# SUMMARY - Phase 15 - Voz Gravada do Cuidador

## Status
Concluida.

## Entregas
- `package.json`: adicionado `expo-audio ~1.0.x` via `npx expo install`.
- `app.json`: plugin `expo-audio` com `microphonePermission` em pt-BR.
- `src/types.ts`: `PersonalSymbol` ganha campo opcional `audioUri`.
- `src/services/personalAudioService.ts` (NOVO): `savePersonalAudioFile` e `deletePersonalAudioFile` gerenciam `documentDirectory/personal-audio/`, mesmo padrao do `personalSymbolsService`.
- `src/App.tsx`:
  - Imports de `expo-audio`: `createAudioPlayer`, `requestRecordingPermissionsAsync`, `useAudioRecorder`, `useAudioRecorderState`, `RecordingPresets`.
  - Novo state: `draftAudioUri`, `audioSymbolId`, `audioPlayerRef`.
  - Hook do recorder (`useAudioRecorder(HIGH_QUALITY)`) + state derivado via `useAudioRecorderState(..., 200ms)` (atualiza `durationMillis`/`isRecording` para a UI).
  - Handlers: `startDraftRecording`, `stopDraftRecording`, `playDraftAudio`, `discardDraftAudio`, `attachRecordedAudioToSymbol`, `openAudioRecorderFor`, `closeAudioRecorder`, `clearSymbolAudio`, `playAudioFromUri`, `teardownAudioPlayer`.
  - `savePendingSymbol` agora inclui `audioUri` opcional no simbolo recem-criado (pode gravar voz durante criacao).
  - `closeSymbolDraft(true)` limpa tanto imagem quanto audio temporario.
  - `removePersonalSymbol` apaga tambem o arquivo de audio associado.
  - `sanitizePersonalSymbols` preserva `audioUri` quando presente, default `null`.
  - Cleanup do player no unmount via `useEffect`.
  - Novo componente `AudioRecorderControls` (botoes Gravar/Parar/Reouvir/Descartar + timer tabular-nums).
  - `SymbolCard` ganha props opcionais `onLongPress` e `hasAudio`: em personal symbols com audio, long press (300ms) aciona reproducao; badge `🔊` sobreposto no canto.
  - Editor "Simbolos" na config modal: cada linha ganha botoes 🎙 (gravar/regravar), 🔇 (remover voz, condicional) e exibe `🔊` no label quando ha audio.
  - Novo modal de gravacao para regravar voz de simbolos existentes; reusa `AudioRecorderControls` e `attachRecordedAudioToSymbol`.
  - Styles novos: `audioBadge`, `audioControlsRow`, `audioButton*` (record/stop/play/discard + text), `audioTimerBox`/`audioTimerText`/`audioTimerTextRecording`.
- `src/__tests__/App.test.tsx`:
  - Mocks de `expo-audio` (createAudioPlayer, useAudioRecorder, etc.) e `personalAudioService`.
  - Teste: simbolo com `audioUri` hidrata e persiste o campo.
  - Teste: long press em simbolo com audio aciona `createAudioPlayer(uri)`.

## Requisitos Atendidos
- **CONT-03**: modo admin -> Simbolos -> botao 🎙 abre modal de gravacao; `requestRecordingPermissionsAsync` pede microfone; gravacao e copiada para `documentDirectory/personal-audio/` e associada ao simbolo. Regravar substitui o arquivo anterior e apaga o orfao.
- **CONT-04**: long press em simbolo pessoal com `audioUri` reproduz o arquivo via `createAudioPlayer`; simbolos sem audio mantem comportamento TTS original ao compor/reproduzir a frase (fluxo do composer inalterado — fallback transparente). Badge `🔊` sinaliza simbolos com voz gravada.

## Decisoes
- **expo-audio em vez de expo-av**: SDK 54 deprecia expo-av em favor de expo-audio/expo-video; hook-driven API (`useAudioRecorder`) encaixa em React functional components sem gerenciamento manual de ciclo de vida.
- **Long press para reproduzir audio em vez de tap**: mantem o contrato do app — tap continua adicionando simbolo a selecao do composer. Long press abre o canal de "escutar a voz do cuidador". Sinal visual discreto (🔊) comunica a possibilidade sem poluir a UI.
- **Audio e especifico de simbolos pessoais, nao de frases**: frases prontas (Phase 13) e composer continuam TTS. Adicionar audio para textos livres exigiria sintese/TTS-substituta para cada palavra, fora da restricao de simplicidade.
- **`RecordingPresets.HIGH_QUALITY`**: m4a com qualidade padrao do preset, ~24kbps por 30s = ~90KB medio. Aceitavel para ~100 simbolos.
- **Regravacao abre modal separado** em vez de reabrir draft completo: usuario nao quer reeditar label/categoria para so atualizar voz.
- **Timer e texto simples** (mm:ss tabular-nums), nao barra de progresso animada: simplicidade e acessibilidade.
- **Cleanup de audioplayer no unmount**: previne memory leak ao fechar o app com player ativo.

## Verificacoes
- `npm run lint`: OK.
- `npm run test -- --runInBand`: 23 tests, 19 passando. 2 novos passam (hidratacao preserva audioUri, long press dispara createAudioPlayer). 4 falhas pre-existentes da Milestone 2 permanecem (mesmo conjunto dos SUMMARYs das Phases 12-14).
- `expo-audio` native build exige rebuild quando o user for empacotar (plugin adiciona a permissao microfone).

## Impacto
- Permissao iOS (`NSMicrophoneUsageDescription`) e Android (`RECORD_AUDIO`) adicionadas via plugin.
- Novo diretorio `documentDirectory/personal-audio/` criado sob demanda; limite implicito = 100 simbolos x ~100KB medio = ~10MB max esperado.
- Superficie de configuracao inalterada (mesmas abas); `SimbolosSection` ganha dois botoes novos por linha (🎙, 🔇 condicional).
- Fluxo principal (composer + TTS) inalterado — fallback transparente para simbolos sem audio.
- Long press de 300ms nao colide com comportamentos existentes.

## Divida Tecnica Observada
- 4 testes pre-existentes continuam falhando (mesma divida herdada de Phase 12). Sugestao de polimento pendente.
- `useAudioRecorder` consome um recorder fixo ao mount; multiplos usuarios gravando simultaneamente nao sao suportados (cenario irreal para AAC single-user).
- `audioPlayerRef` e cleanup no unmount sao defensivos; interrupcoes nativas (chamada, fundo) podem ainda deixar player em estado inconsistente — aceitavel para esse caso de uso.

## Proximo Passo
- Phase 16: Rotina Visual e Polimento — editor de rotina ordenada, tela dedicada do dia, regressao final dos fluxos principais.
