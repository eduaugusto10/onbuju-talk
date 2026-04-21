# SUMMARY - Phase 13 - Frases Prontas e Historico

## Status
Concluida.

## Entregas
- `src/types.ts`: novos tipos `SavedPhrase` e `HistoryPhrase`.
- `src/constants.ts`: `DEFAULT_SAVED_PHRASES` (6 frases pt-BR), `SAVED_PHRASES_MAX = 30`, `PHRASE_HISTORY_MAX = 20`.
- `src/App.tsx`:
  - Novas chaves `STORAGE_KEYS.savedPhrases` e `STORAGE_KEYS.phraseHistory`.
  - Estado `savedPhrases` (default pt-BR) e `phraseHistory` (vazio), hidratacao no boot e persistencia via AsyncStorage.
  - Helpers `normalizeSpokenText`, `sanitizeSavedPhrases`, `sanitizePhraseHistory`, `buildDefaultSavedPhrases`.
  - Handlers: `recordPhraseHistory`, `speakPhraseText`, `addSavedPhrase`, `removeSavedPhrase`, `startEditingPhrase`, `commitEditingPhrase`, `cancelEditingPhrase`, `clearPhraseHistory`.
  - `handlePlay` agora registra o texto falado no historico (dedup case-insensitive, cap 20).
  - `ConfigSection` passa a incluir `'frases'`.
  - Categorias novas na barra de categorias: `Frases` e `Historico`.
  - `handleCategoryClick` nao chama ARASAAC para as categorias novas.
  - Novo render no list card: `FlatList` vertical (numColumns=1) de `PhraseCard` para ambas as categorias novas; empty state especifico.
  - Componente novo `PhraseCard` (tap = falar, admin ve botao remover em Frases; Historico e somente leitura).
  - Nova secao admin "Frases" em `ConfigNav` com icone `💬`: lista editavel com editar, salvar, cancelar, remover, adicionar nova, e botao "Limpar historico (N)". Mensagem de bloqueio quando nao-admin, identico a secao Vocabulario.
- `src/__tests__/App.test.tsx`: 3 testes novos cobrindo frases padrao, reproducao + historico e persistencia do historico no boot.

## Requisitos Atendidos
- **COMM-03**: categoria "Frases" mostra banco pre-instalado em pt-BR; tap dispara `Speech.speak` em pt-BR imediatamente.
- **COMM-04**: secao admin "Frases" permite adicionar, editar (OK/cancelar inline) e remover frases com validacao de dedup e limite `SAVED_PHRASES_MAX = 30`.
- **COMM-05**: categoria "Historico" mostra as ultimas frases faladas em ordem decrescente; `handlePlay` (composer) e `speakPhraseText` (frases prontas/historico) alimentam o mesmo historico, respeitando `PHRASE_HISTORY_MAX = 20`.

## Decisoes
- Frases prontas e Historico foram modelados como **novas categorias** na barra ja existente, reutilizando o container `listCard`. Evita adicionar nova tela/modal, preservando a restricao dura de simplicidade do projeto (publico autista).
- `PhraseCard` e puramente textual (sem imagens). Motor planning de frases depende de consistencia de posicao e legibilidade do texto grande; imagens adicionariam ruido.
- Historico deduplicado por texto case-insensitive: ao re-falar uma frase repetida, o item existente e promovido ao topo em vez de criar duplicata. Cap fixo de 20 evita memoria crescente.
- Historico nao e editavel pelo usuario final. Botao "Limpar historico" so esta disponivel no editor admin (para casos de reset pelo cuidador).
- `handlePlay` loga no historico imediatamente apos `Speech.speak`, nao em `onDone`, para nao depender de callback que falha silenciosamente em alguns dispositivos.
- Edicao de frase usa inline input (TextInput) dentro da mesma linha do editor — consistente com pattern de `CoreVocabEditor` (Phase 12) embora com semantica diferente (editar em vez de reordenar).

## Verificacoes
- `npm run lint`: OK.
- `npm run test -- --runInBand`: 3 testes novos passam (frases padrao, falar+historico, restaurar historico salvo). 4 falhas pre-existentes herdadas da Milestone 2 (icone `☰`, texto "Configuração") permanecem como divida tecnica — mesmo conjunto listado no SUMMARY da Phase 12; nao sao regressao desta fase. Delta: +4 tests passando (5 -> 9 em `App.test.tsx`), 0 novas falhas.
- Verificacao TypeScript estrita mantida; imports organizados.

## Impacto
- Barra de categorias ganha 2 botoes novos (Frases, Historico) apos "Tudo". Testes de densidade (2-5 colunas) nao sao afetados — as categorias novas renderizam FlatList de linha unica, nao grade.
- Superficie de configuracao: +1 aba "Frases" na `configNav`.
- Comportamento offline: inalterado — frases e historico sao puramente locais em AsyncStorage.
- Acessibilidade: labels descritivos em todos os Pressable (`Falar frase X`, `Editar frase X`, `Remover frase X`, `Salvar edicao da frase X`).
- Contraste alto: estilos `phraseCardHighContrast` / `phraseEditorRowHighContrast` seguem paleta do projeto.
- `handlePlay` recebe pequeno refactor: usa `normalizeSpokenText` antes de detectar string vazia; comportamento observavel do composer permanece.

## Divida Tecnica Observada
- 4 testes pre-existentes continuam falhando (icone `☰`, texto "Configuração") — herdados de Phase 12, nao tocados nesta fase. Sugestao mantida: fase de polimento dedicada a ressincronizar test suite com UI atual.
- Sem acao adicional para desduplicacao por acentuacao (`agua` vs `água`). Normalizacao apenas remove whitespace excedente e compara em lowercase. Caso surja confusao, considerar remover diacriticos no futuro.

## Proximo Passo
- Phase 14: Simbolos Pessoais (Camera, Galeria) e Categorias Customizadas.
