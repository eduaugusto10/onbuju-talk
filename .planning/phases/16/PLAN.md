# PLAN - Phase 16 - Rotina Visual e Polimento da Milestone

## Objetivo
Entregar a rotina visual do dia (sequencia ordenada de simbolos com marcacao de passos concluidos) e consolidar a milestone v4 sem regressao nos fluxos principais. Respeitar a restricao dura de simplicidade para publico autista.

## Requisitos Mapeados
- ORG-01: cuidador monta rotina visual como sequencia ordenada de simbolos.
- ORG-02: usuario visualiza rotina do dia em tela dedicada e marca cada passo como concluido.

## Escopo
- Novos tipos `RoutineStep` e `RoutineProgress` em `src/types.ts`.
- Nova chave em `STORAGE_KEYS`: `routineSteps`, `routineProgress`.
- Persistencia:
  - `routineSteps`: sequencia configurada pelo cuidador. Persistente.
  - `routineProgress`: `{ dateIso: 'YYYY-MM-DD', completedStepIds: string[] }`. Reinicia no dia seguinte automaticamente (mudanca de data detectada em boot).
- Tela dedicada para a rotina — implementada como **nova categoria virtual** "Rotina" na barra de categorias (consistente com Frases/Historico e mantendo simplicidade). Ao selecionar, lista vertical de cards grandes de passos com status (concluido/pendente).
- Editor admin no config modal:
  - Nova `ConfigSection 'rotina'` com `ConfigNavItem "Rotina"` (icone `📅`).
  - Lista dos `routineSteps` com ordem visivel, cada linha com:
    - Rotulo/miniatura do simbolo (resolvido por id contra personalSymbols, favorites, symbols ARASAAC caregados, customSymbols — fallback para texto quando nao resolve).
    - Botoes ↑ / ↓ para reordenar, ✕ para remover.
  - Picker de simbolo para adicionar passo:
    - Opcao simples: TextInput + label + opcional imagem (file picker). MVP sem picker visual para simplicidade: o cuidador digita um rotulo; se houver correspondencia label -> simbolo conhecido, usa a imagem; senao, chip textual (igual ao core vocab bar).
    - Alternativa mais rica (post-MVP): navegacao para selecionar simbolo. Fora de escopo aqui.
  - Botao "Limpar progresso do dia" para reset manual.
- Render da rotina (categoria "Rotina"):
  - Cabecalho com data do dia (`YYYY-MM-DD` formatado em pt-BR: "Hoje, 21 de abril").
  - FlatList vertical de `RoutineStepCard` grandes:
    - Tap marca/desmarca o passo.
    - Estilo visual diferenciado para concluido (check icon, opacidade reduzida, borda verde).
    - Tamanho generoso (min 72px por card) e texto 18pt scalado.
  - Empty state: "Ainda nao ha rotina configurada. Peca ao cuidador para adicionar os passos."
- Regressao dos fluxos principais:
  - Nada alterado em composer, frases prontas, historico, simbolos pessoais ou voz.
  - Smoke test manual checklist no SUMMARY.
- `npm run lint` e `npm run test -- --runInBand` sem erros novos.
- Checklist atualizado de release (`RELEASE-CHECKLIST.md`).
- Arquivos de polimento se identificados durante regressao (escopo condicional).

## Fora de Escopo
- Multiplas rotinas por dia da semana.
- Notificacoes/lembretes de hora para cada passo.
- Agrupamento visual por manha/tarde/noite.
- Progresso historico acumulado entre dias (so o dia atual e guardado).
- Drag-and-drop de passos — usamos ↑/↓ para consistencia com editor de vocabulario core.
- Import/export de rotina.
- Fotografia inline do passo — passos reusam simbolos existentes (ARASAAC, pessoais, textuais).
- Somar simbolos a frase ao tocar o passo — tap marca/desmarca, nao alimenta composer.

## Arquivos Alvo
- `src/types.ts` (novos tipos)
- `src/constants.ts` (`ROUTINE_STEPS_MAX = 30`)
- `src/App.tsx` (state, hydrate, persist, handlers, render da rotina na list card, editor admin)
- `src/__tests__/App.test.tsx` (2-3 testes)
- `.planning/RELEASE-CHECKLIST.md` (atualizar para v4; regressao)

## Plano de Implementacao

1. **Tipos**
   - `RoutineStep { id: string; label: string; imageUri?: string | null; createdAt: string }`.
   - `RoutineProgress { date: string; completedStepIds: string[] }`.

2. **Constantes**
   - `ROUTINE_STEPS_MAX = 30`.

3. **STORAGE_KEYS**
   - `routineSteps: 'arasaac_routine_steps'`
   - `routineProgress: 'arasaac_routine_progress'`

4. **Sanitizers**
   - `sanitizeRoutineSteps(raw): RoutineStep[]` com dedup por id e cap ROUTINE_STEPS_MAX.
   - `sanitizeRoutineProgress(raw): RoutineProgress` com validacao da data (YYYY-MM-DD); se data != hoje, retorna `{ date: today, completedStepIds: [] }`.

5. **State**
   - `routineSteps`, `routineProgress`, `newRoutineLabel`.

6. **Hidratacao**
   - Adicionar ambas chaves ao Promise.all do boot.
   - Na leitura de `routineProgress`, comparar data com `new Date().toISOString().slice(0,10)`; se diferente, trocar por `{ date: today, completedStepIds: [] }`.

7. **Persistence**
   - useEffect para persistir `routineSteps` e `routineProgress`.

8. **Helpers para mudanca de dia**
   - Funcao `getTodayIso(): string`.
   - Ao togglar um passo, se `routineProgress.date !== getTodayIso()`, resetar antes de aplicar o toggle.

9. **Handlers**
   - `addRoutineStep()`: usa `newRoutineLabel`, valida nao-vazio, dedup por label case-insensitive, limite MAX. Gera `RoutineStep` com `id: step-<ts>`.
   - `removeRoutineStep(id)`: filtra passo e remove dos completedStepIds.
   - `moveRoutineStep(id, direction)`: identico ao moveCoreVocabularyWord.
   - `toggleRoutineStep(id)`: adiciona ou remove do `completedStepIds`, resetando para hoje se necessario.
   - `resetTodayProgress()`: limpa `completedStepIds` mantendo data.

10. **Barra de categorias**
    - Nova constante `CATEGORIES.routine = 'Rotina'`.
    - `CategoryButton` apos Historico (antes de Customizados) quando `routineSteps.length > 0` OR sempre (mostrar vazio com empty state instrutivo).
    - `handleCategoryClick`: tratar 'Rotina' como categoria nativa nao-ARASAAC.

11. **Render da rotina**
    - Branch novo no list card: activeCategory === CATEGORIES.routine.
    - Cabecalho simples com label "Rotina do dia" + data formatada.
    - FlatList vertical de `RoutineStepCard`:
      - Props: `{ step, completed, onToggle, uiScaleFactor, highContrast }`.
      - Render: Pressable com imagem (se imageUri) OU chip textual, rotulo grande, check icon `✓` ou vazio.
      - Estilo: concluido = background verde claro + borda, texto mais opaco (riscado ou cinza).

12. **Editor admin (configSection === 'rotina')**
    - Similar ao Vocabulario/Frases:
      - Lista dos passos com rotulo + botoes ↑/↓/✕.
      - TextInput + botao Adicionar.
      - Botao "Limpar progresso do dia" (chama resetTodayProgress, mostra toast).
      - Mensagem de bloqueio quando nao-admin.
    - ConfigNavItem "Rotina" (icone `📅`).

13. **Testes**
    - Teste 1: hidrata rotina com passos e progresso do dia atual; categoria "Rotina" mostra passos com status correto.
    - Teste 2: tap em um passo marca como concluido (check icon aparece) e persiste no AsyncStorage com a data de hoje.
    - Teste 3: hidrata progresso de data antiga; apos mount, o progresso e resetado (ja persistido).

14. **Regressao**
    - Rodar test suite completo — confirmar que numero de passing tests sobe em +2/+3 (novos) sem novas falhas.
    - Checklist manual:
      - Composer: selecionar, gerar, ouvir.
      - Frases prontas: tocar.
      - Historico: ver registro novo apos falar.
      - Simbolo pessoal: criar, usar, long press com audio.
      - Categorias custom: criar, filtrar.
      - Vocabulario core: tap, editor.
      - Rotina: criar passo, marcar concluido, resetar.
    - Documentar resultado no SUMMARY.

15. **Checklist de release**
    - Atualizar `.planning/RELEASE-CHECKLIST.md` para v4 com items de regressao.

16. **Fechamento**
    - `npm run lint`.
    - `npm run test -- --runInBand`.
    - `SUMMARY.md` + `STATE.md` + `ROADMAP.md` + `PROJECT.md` (milestone concluida).

## Criterios de Aceite (UAT)
1. Cuidador monta uma rotina com passos em ordem no editor admin; a ordem se reflete na categoria "Rotina" imediatamente.
2. Usuario marca um passo como concluido; visualmente o passo fica diferenciado dos proximos.
3. Reordenar no editor reflete imediatamente na categoria "Rotina".
4. Progresso da rotina permanece apos reiniciar o app dentro do mesmo dia; ao trocar de dia, o progresso e resetado automaticamente.
5. Fluxos principais (composer, frases prontas, historico, simbolos pessoais, voz, categorias custom, vocabulario core) continuam funcionando sem regressao.
6. `npm run lint` e `npm run test -- --runInBand` sem erros novos.

## Verificacao
- Validacao automatizada:
  - `npm run lint`
  - `npm run test -- --runInBand`
- Validacao manual:
  - Criar 3 passos ("Acordar", "Escovar dentes", "Tomar cafe").
  - Marcar "Acordar" como concluido -> status diferenciado.
  - Reiniciar app -> progresso permanece.
  - Editar data do sistema para o dia seguinte (ou aguardar dia real) -> progresso resetado.
  - Regressao de cada fluxo principal.

## Riscos
- Reset diario pode disparar em fusos horarios diferentes de forma inesperada.
- Labels sem imagem geram cards so-texto que podem destoar visualmente.
- Ordem persistida em array pode corromper se usuario editar em varios dispositivos (fora do escopo — app e local-first).

## Mitigacoes
- Usar `new Date().toISOString().slice(0,10)` baseado no horario local do dispositivo. Aceitar imprecisao sobre meia-noite.
- Chip textual consistente com core vocab e composer; estetica unificada.
- Persistencia simples por JSON; user edita em um dispositivo por instalacao.

## Dependencias
- Depends on: Phases 13, 14, 15 (rotina pode consumir simbolos pessoais com voz; frases prontas/historico nao interferem).
- Desbloqueia: milestone v4 completa.
