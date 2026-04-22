# PLAN - Phase 15 - Voz Gravada do Cuidador

## Objetivo
Permitir que o cuidador grave audio para um simbolo (via flow de criacao/edicao), vincule esse audio ao simbolo e reproduza-o no tap em vez do TTS, com fallback transparente para TTS quando nao houver gravacao. Restricao dura: simplicidade acima de riqueza de features.

## Requisitos Mapeados
- CONT-03: gravacao de audio do cuidador associado ao simbolo.
- CONT-04: reproducao do audio gravado com fallback transparente para TTS.

## Escopo
- Adicionar dependencia nativa `expo-audio` (modulo oficial do Expo SDK 54 para gravacao + reproducao; substituto moderno do `expo-av`).
- Atualizar `app.json` plugins para incluir config do `expo-audio` com `microphonePermission` em pt-BR.
- Novo service `src/services/personalAudioService.ts` espelhando `personalSymbolsService`:
  - Diretorio `documentDirectory/personal-audio/`.
  - `savePersonalAudioFile(sourceUri): Promise<string>` — copia o arquivo temporario gravado para o diretorio gerenciado, nome `audio-<ts>-<rand>.<ext>`.
  - `deletePersonalAudioFile(uri): Promise<void>` — tolerante, so apaga dentro do diretorio.
- Extender `PersonalSymbol` com `audioUri?: string | null`. Sanitizer aceita ambos casos (legacy sem audio).
- Aumentar draft modal (do simbolo) com:
  - Botao "Gravar" que inicia/pausa gravacao via `expo-audio`.
  - Timer textual simples (0:00 / mm:ss).
  - Botao "Reouvir" para tocar gravacao.
  - Botao "Regravar" que descarta a anterior e abre nova gravacao.
  - Ao salvar, o audio gravado e movido para `documentDirectory/personal-audio/`.
- Novo state em App.tsx: `draftAudioUri`, `draftAudioDurationMs`, `isRecording`, `isPlayingDraftAudio`, `recordingElapsedMs`.
- `addSymbol`/tap em simbolo pessoal com `audioUri` reproduz o audio gravado em vez do TTS:
  - Novo helper `playPersonalSymbolAudio(uri: string): Promise<void>` que instancia um player leve via `expo-audio` e toca.
  - Integrar no handler de tap do `SymbolCard` SOMENTE para `PersonalSymbol`s com audio. Demais simbolos continuam via fluxo TTS atual (composer).
  - **IMPORTANTE**: nao alterar comportamento existente — tap continua adicionando ao composer. Acrescentar um **segundo** toque longo (long press) OU um botao pequeno no canto do card que dispara reproducao do audio pessoal. Para manter simplicidade e consistencia, vamos usar **long press** em personal symbols com audio — feedback: icone de audio discreto sobreposto no card.
  - Alternativa considerada: play automatico no tap + adicao ao composer. Rejeitada por quebrar o contrato do resto do app.
- Editor "Simbolos" no config modal:
  - Badge/indicador visual para simbolos que tem audio gravado (ex: "🔊" em verde).
  - Botao "Regravar" para simbolos existentes que abre o mini-modal de gravacao reusando o mesmo componente.
- UI visual de gravacao: botao pulsante simples (cor vermelho suave) enquanto `isRecording`. Tempo atualiza a cada 100ms via interval.

## Fora de Escopo
- Edicao/trimagem do audio gravado.
- Efeitos, filtros ou normalizacao de volume.
- Reproducao em loop ou fila.
- Gravacao multi-idioma ou multi-track.
- Reconhecimento de voz / transcricao.
- Compartilhamento de audio entre dispositivos.
- Audio para frases prontas (Phase 13) — so simbolos pessoais nesta fase.
- Audio para vocabulario core (Phase 12).

## Arquivos Alvo
- `package.json` (dep `expo-audio`).
- `app.json` (plugin + pt-BR microphone permission).
- `src/types.ts` (`PersonalSymbol.audioUri`).
- `src/services/personalAudioService.ts` (NOVO).
- `src/App.tsx` (state, hydrate/persist via PersonalSymbol, handlers gravar/parar/regravar/reouvir, UI draft, UI editor, integração long-press).
- `src/__tests__/App.test.tsx` (2-3 testes).

## Plano de Implementacao

1. **Dependencia**
   - `npx expo install expo-audio`.
   - `app.json` plugins: acrescentar entry `[ "expo-audio", { "microphonePermission": "O Fala usa o microfone para gravar a voz do cuidador e associar a simbolos." } ]`.

2. **Types**
   - `PersonalSymbol` ganha `audioUri?: string | null`. `sanitizePersonalSymbols` aceita e preserva.

3. **Service**
   - `personalAudioService.ts` com `savePersonalAudioFile` e `deletePersonalAudioFile`. Estilo identico ao `personalSymbolsService`.
   - Extensao: `.m4a` default, derivada do URI original se disponivel.

4. **State e helpers (App.tsx)**
   - `const [draftAudioUri, setDraftAudioUri] = useState<string | null>(null)` (URI temporario da gravacao antes de commit no simbolo).
   - `const [isRecording, setIsRecording] = useState(false)`.
   - `const [recordingElapsedMs, setRecordingElapsedMs] = useState(0)`.
   - `const [isPlayingDraftAudio, setIsPlayingDraftAudio] = useState(false)`.
   - Refs: `recorderRef`, `playerRef`, `recordingIntervalRef`.

5. **Gravacao no draft modal**
   - `startRecording()`: pede permissao microfone (`Audio.requestRecordingPermissionsAsync` ou equivalente do expo-audio), cria recorder, inicia, timer a cada 100ms.
   - `stopRecording()`: para timer, `recorder.stop()`, obtem URI, armazena em `draftAudioUri`.
   - `playDraftAudio()`: cria player com URI e toca.
   - `discardDraftAudio()`: apaga URI temporario via `deletePersonalAudioFile`, zera state.
   - Cleanup no `cancelPendingSymbol`: se tem draft audio, deletar.

6. **Commit do simbolo**
   - `savePendingSymbol`: se `draftAudioUri` existe, manter URI (ja vem do service e esta em `documentDirectory`).
   - Senao, criar simbolo com `audioUri: null`.

7. **Regravar em simbolo existente**
   - No editor "Simbolos" (config), adicionar botao "🎙 Gravar voz" por linha. Ao clicar: abre um modal de gravacao inline (reusando componente da gravacao). Ao salvar, o `audioUri` antigo e apagado, o novo e gravado.
   - Badge `🔊` no card se `audioUri` existir.

8. **Tap integration**
   - No `SymbolCard`, se o `item.category === 'personal'` e tem audio (sinalizacao via prop extra), adicionar `onLongPress` que dispara `playPersonalSymbolAudio(audioUri)`.
   - Sinal visual discreto: pequeno badge `🔊` no canto superior esquerdo do card (oposto do favorite star) quando ha audio.
   - **Decisao minimalista**: como `SymbolCard` recebe apenas `SymbolItem`, passaremos `hasAudio` + `onPlayAudio` opcional. `imageUrl` vazio? nao — continua sendo a imagem normal.

9. **Fallback TTS no composer**
   - Nenhuma mudanca necessaria — composer continua falando o texto da frase. O audio gravado e especifico do simbolo individual (long press), nao da frase.
   - Documentar no SUMMARY: "reproducao automatica do audio no lugar do TTS" e interpretada como **ao interagir com o simbolo**, nao como parte da frase composta. Simplifica o modelo mental e respeita a restricao de simplicidade.

10. **Testes**
    - Mock `expo-audio`: `requestRecordingPermissionsAsync` true, `AudioModule.createRecorder` retorna objeto com `startAsync` / `stopAndUnloadAsync`, `AudioModule.createAudioPlayer` retorna objeto com `play`/`pause`/`remove`. Em realidade, expo-audio tem hooks (`useAudioRecorder`, `useAudioPlayer`) e APIs imperativas; mockaremos apenas o que usamos.
    - Mock `personalAudioService`: `savePersonalAudioFile` retorna `file:///doc-dir/personal-audio/a.m4a`; `deletePersonalAudioFile` no-op.
    - Teste 1: simbolo com audioUri hidratado mostra badge 🔊 no editor admin.
    - Teste 2: save do simbolo via draft modal com draftAudioUri grava no AsyncStorage com `audioUri` populado.
    - Teste 3: long-press em personal symbol com audio dispara `playPersonalSymbolAudio` (via spy).

    Devido a complexidade dos hooks de audio para testar de forma util, manter escopo de teste pragmatico: focar no state management e persistence, nao no timing do player.

11. **Fechamento**
    - `npm run lint` sem erros.
    - `npm run test -- --runInBand` passa com 2-3 testes novos.
    - `SUMMARY.md` + `STATE.md` + `ROADMAP.md`.

## Criterios de Aceite (UAT)
1. Cuidador (admin) abre o editor "Simbolos", seleciona um simbolo pessoal existente e grava audio; o audio e persistido e associado.
2. Usuario faz long press no simbolo na grade -> ouve a gravacao em vez do TTS.
3. Simbolos sem audio continuam reproduzindo via TTS no composer (fallback transparente).
4. Cuidador regrava o audio e a nova gravacao substitui a anterior sem duplicar arquivos.
5. Audios gravados persistem apos reiniciar o app.
6. `npm run lint` e `npm run test -- --runInBand` sem erros novos.

## Verificacao
- Validacao automatizada:
  - `npm run lint`
  - `npm run test -- --runInBand`
- Validacao manual (device necessario para microfone):
  - Admin -> Simbolos -> Selecionar simbolo -> Gravar voz -> Reouvir -> Salvar.
  - Long press no simbolo na grade -> audio toca.
  - Remover simbolo -> arquivo de audio tambem removido do FileSystem.
  - Reiniciar -> audio persiste.

## Riscos
- API do `expo-audio` divergente do `expo-av` — precisa de setup diferente (hooks) que pode nao encaixar com callbacks imperativos.
- Permissao negada: toast e abort.
- Interrupcao (ex: ligacao) durante gravacao — gravacao pode falhar silenciosamente.
- `expo-audio` pode nao estar estavel na versao pareada com SDK 54; cair para `expo-av` se necessario.
- Arquivos de audio grandes (gravacao longa) podem crescer storage.

## Mitigacoes
- Usar API imperativa se disponivel; caso contrario, adaptar com hooks minimos.
- `try/catch` em todas as operacoes de gravacao/reproducao com toast de erro amigavel.
- Limite implicito de ~30s sugerido via toast (nao hard-cap no bloqueio).
- Compressao m4a default do expo-audio e suficiente.

## Dependencias
- Depends on: Phase 14 (editor de simbolo pessoal com draft modal ja implementado).
- Desbloqueia: Phase 16 (rotina visual pode consumir simbolos com audio naturalmente).
