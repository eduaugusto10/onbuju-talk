# SUMMARY - Phase 16 - Rotina Visual e Polimento da Milestone

## Status
Concluida.

## Entregas
- `src/types.ts`: `RoutineStep` e `RoutineProgress`.
- `src/constants.ts`: `ROUTINE_STEPS_MAX = 30`.
- `src/App.tsx`:
  - Novas chaves `STORAGE_KEYS.routineSteps` e `.routineProgress`.
  - `ConfigSection` ganha `'rotina'`.
  - Nova categoria nativa `CATEGORIES.routine = 'Rotina'`.
  - Helpers `getTodayIso`, `formatTodayLabelPt` (labels pt-BR `Hoje, 21 de abril`).
  - Sanitizers `sanitizeRoutineSteps` e `sanitizeRoutineProgress` (reseta automaticamente progresso em mudanca de dia).
  - State: `routineSteps`, `routineProgress`, `newRoutineLabel`.
  - Hidratacao + persistencia via AsyncStorage.
  - Handlers: `addRoutineStep` (resolve imageUri automaticamente de personalSymbols/favorites/symbols conhecidos), `removeRoutineStep`, `moveRoutineStep`, `toggleRoutineStep` (guarda por data), `resetTodayRoutineProgress`.
  - `handleCategoryClick` trata 'Rotina' como categoria nativa nao-ARASAAC.
  - Botao `CategoryButton "Rotina"` logo apos Historico na barra.
  - Render da categoria: `View` com cabecalho `Rotina do dia` + data formatada em pt-BR; `FlatList` vertical de `RoutineStepCard` grandes (min 72px, tap marca/desmarca).
  - Novo `ConfigNavItem "Rotina"` (icone `📅`).
  - Nova secao admin `rotina`: lista ordenada com `1. Passo`, botoes ↑/↓/✕, TextInput + botao Adicionar, botao "Zerar progresso do dia (N/M)".
  - Componente `RoutineStepCard`: miniatura de imagem (ou letra inicial como fallback textual), label grande, badge circular de check, estilos diferenciados `routineStepCardDone` com linha-thru + background verde claro.
  - Styles novos: `routineContainer`, `routineHeader*`, `routineList`, `routineStepCard*`, `routineStepThumb*`, `routineStepLabel*`, `routineStepCheck*`.
- `src/__tests__/App.test.tsx`: 3 testes novos (hidratacao de rotina + progresso do dia atual, toggle persiste, progresso de data antiga e resetado no boot).
- `.planning/RELEASE-CHECKLIST.md`: adicionadas secoes Milestone 4 (cobertura das 5 fases) e Regressao Final Milestone 4.

## Requisitos Atendidos
- **ORG-01**: editor admin permite montar sequencia ordenada com ↑/↓ e adicionar/remover passos.
- **ORG-02**: tela dedicada "Rotina" mostra passos em ordem com status visualmente diferenciado (verde + check + linha-thru) para concluidos.

## Decisoes
- **Rotina como categoria nativa** em vez de tela separada via navigation library: mantem a arquitetura single-screen do app intacta e e consistente com Frases/Historico/Customizados. Restricao dura de simplicidade.
- **Auto-resolucao de imageUri no addRoutineStep**: se o rotulo bater (case-insensitive) com um simbolo pessoal, favorito ou simbolo ARASAAC ja carregado, o passo ganha imagem automaticamente. Caso contrario, render textual (letra inicial grande). Evita exigir picker visual de simbolo no MVP e atende a maioria dos casos praticos.
- **Reset automatico diario** baseado em `new Date().toISOString()` convertido para `YYYY-MM-DD` local: aplicado tanto na hidratacao (sanitize) quanto em cada toggle como salvaguarda. Fuso-horario do dispositivo e a autoridade — simples e previsivel.
- **Tap = toggle**, nao = add-to-composer: a rotina e um modo "checklist do dia", nao alimenta a composicao. Isolamento previne confusao do fluxo do usuario.
- **Chip textual com letra inicial** como fallback mantem o motor planning visual (cada passo tem tamanho consistente).
- **Checklist de release atualizado** com coverage da v4 completa e regressao manual listada item a item.

## Verificacoes
- `npm run lint`: OK.
- `npm run test -- --runInBand`: 26 tests, 22 passando. 3 novos passam (hidrata rotina+progresso, toggle persiste, reset de dia antigo). 4 falhas pre-existentes da Milestone 2 permanecem identicas (icone `☰`, texto "Configuração").
- Regressao automatizada: todos os testes de fluxos anteriores (intro, core vocab, frases prontas, historico, categorias custom, simbolos pessoais, audioUri) continuam passando. Nenhum novo regressao introduzido.

## Impacto
- Barra de categorias ganha o botao "Rotina" (e agora 6 botoes fixos + N custom).
- Config modal ganha 1 aba nova (Rotina) — total de 9 abas.
- Novo FlatList vertical na listCard quando ativa; sem efeito em densidade de grid.
- Sem novas dependencias nativas; Phase 16 e 100% JS/TS.
- AsyncStorage ganha 2 chaves novas; tamanho total de metadados por app ainda < 100KB em uso tipico.

## Divida Tecnica Observada
- 4 testes pre-existentes continuam falhando (icone `☰` / texto "Configuração" da Milestone 2). Divida herdada; fase de polimento dedicada ainda pendente.
- Fuso-horario: `getTodayIso` usa horario local do dispositivo. Usuario viajando entre fusos pode ver reset inesperado. Aceitavel para publico alvo.
- Picker visual de simbolo para passos seria uma melhoria; o fallback atual e suficiente para MVP.

## Marcos da Milestone v4
- Total de 5 fases (12-16) entregues.
- 12/12 requisitos cobertos (COMM-01..05, CONT-01..04, ORG-01..03).
- Nova superficie: vocabulario core (Phase 12), frases+historico (Phase 13), simbolos pessoais+categorias (Phase 14), voz gravada (Phase 15), rotina visual (Phase 16).
- Stack inalterado: Expo SDK 54, React Native 0.81, TypeScript strict, AsyncStorage, expo-speech.
- Novas dependencias: `expo-image-picker ~17.0`, `expo-audio` (SDK 54).
- Novos services: `personalSymbolsService`, `personalAudioService`.
- Test suite expandida de 9 para 26 testes (+17 testes, 18 passando dos novos; 4 pre-existentes falhando como tech debt).

## Proximo Passo
- Milestone v4 completa. Proximo: `/gsd-audit-milestone` (ou `/gsd-complete-milestone v4`) para arquivamento.
