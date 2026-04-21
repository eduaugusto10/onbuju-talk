# PLAN - Phase 13 - Frases Prontas e Historico

## Objetivo
Permitir comunicacao de um toque com (1) banco de frases pre-montadas pelo cuidador e (2) historico automatico das ultimas frases faladas, mantendo simplicidade (publico autista) e reaproveitando a infra de categorias/list existente.

## Requisitos Mapeados
- COMM-03: banco de frases prontas, reproducao em 1 toque.
- COMM-04: cuidador adiciona, edita e remove frases prontas no modo admin.
- COMM-05: historico automatico de ultimas frases faladas, reuso em 1 toque.

## Escopo
- Novos tipos `SavedPhrase` e `HistoryPhrase` em `src/types.ts`.
- Padrao pt-BR de frases prontas em `src/constants.ts` (ex.: "quero banheiro", "estou com fome", "me ajuda", "quero agua", "quero brincar", "obrigado").
- Duas novas chaves em `STORAGE_KEYS`: `savedPhrases`, `phraseHistory`.
- Hidratacao e persistencia de ambos os estados, seguindo padrao das outras chaves.
- Duas novas categorias na barra de categorias: "Frases" e "Historico".
- Quando a categoria ativa for Frases ou Historico: lista vertical (numColumns=1) de cards grandes com texto, tap = `Speech.speak` imediato.
- Cada play (via `handlePlay` OU via frase pronta/historico) registra no historico: dedup por texto case-insensitive, cap 20, ordenado por uso mais recente.
- Frases prontas mostram botao de excluir inline quando `isAdmin`.
- Nova secao admin "Frases" na `configNav`:
  - Adicionar nova frase (TextInput + botao).
  - Editar frase existente (inline ou alternando input).
  - Remover frase.
  - Mensagem de bloqueio quando nao-admin (igual secao Vocabulario).
- `ConfigSection` passa a incluir `'frases'`.
- Testes novos em `App.test.tsx`: padrao de frases pre-instaladas, tocar frase pronta dispara speak + entra no historico, persistencia apos reload.

## Fora de Escopo
- Tela/modal dedicado para frases (reusamos o list card existente via categorias — simplicidade).
- Busca textual dentro das frases prontas.
- Categorizacao/tags de frases.
- Editar no momento da reproducao pelo usuario final.
- Importar/exportar frases.
- Limite configuravel do historico (cap 20 fixo).

## Arquivos Alvo
- `src/types.ts` (novos tipos)
- `src/constants.ts` (DEFAULT_SAVED_PHRASES, PHRASE_HISTORY_MAX, SAVED_PHRASES_MAX)
- `src/App.tsx` (state, hydrate, persist, categorias, render de frases/historico, handlers speak/add/edit/remove, secao admin de edicao)
- `src/__tests__/App.test.tsx` (3 testes novos)

## Plano de Implementacao

1. Tipos
   - Em `src/types.ts`: `export interface SavedPhrase { id: string; text: string; createdAt: string }` e `export interface HistoryPhrase { id: string; text: string; spokenAt: string }`.

2. Constantes
   - Em `src/constants.ts`:
     - `DEFAULT_SAVED_PHRASES: string[]` = ['quero banheiro', 'estou com fome', 'me ajuda', 'quero agua', 'quero brincar', 'obrigado'].
     - `SAVED_PHRASES_MAX = 30`, `PHRASE_HISTORY_MAX = 20`.

3. Storage keys
   - Adicionar `savedPhrases: 'arasaac_saved_phrases'` e `phraseHistory: 'arasaac_phrase_history'` em `STORAGE_KEYS`.

4. Estado + helpers
   - `const [savedPhrases, setSavedPhrases] = useState<SavedPhrase[]>(...)` com fallback para defaults construidos de `DEFAULT_SAVED_PHRASES`.
   - `const [phraseHistory, setPhraseHistory] = useState<HistoryPhrase[]>([])`.
   - `const [newPhraseInput, setNewPhraseInput] = useState('')` e `const [editingPhraseId, setEditingPhraseId] = useState<string | null>(null)` com `editingPhraseText`.
   - Helpers `normalizeSpokenText(text)` (trim + collapse whitespace, mantem case), `buildPhraseId(prefix)` com `Date.now()`.
   - `sanitizeSavedPhrases(raw): SavedPhrase[]` e `sanitizePhraseHistory(raw): HistoryPhrase[]` para parses defensivos do AsyncStorage.

5. Hidratacao
   - Adicionar `AsyncStorage.getItem(STORAGE_KEYS.savedPhrases)` e `.phraseHistory` ao Promise.all do boot.
   - Parse, aplicar sanitize; se invalido/vazio: `savedPhrases` cai para defaults construidos do `DEFAULT_SAVED_PHRASES`; `phraseHistory` fica vazio.

6. Persistencia
   - `useEffect` para persistir JSON de ambos sempre que mudarem.

7. Categorias
   - Declarar `CATEGORIES.savedPhrases = 'Frases'` e `CATEGORIES.history = 'Historico'`.
   - Renderizar botoes no ScrollView de categorias logo apos "Tudo" (frases antes do historico).
   - `handleCategoryClick`: quando categoria e `Frases` ou `Historico`, nao chamar `arasaacService`; apenas setar ativo e limpar search.

8. Render da lista
   - Em `symbolsToRender`/render do listCard, adicionar ramo novo quando activeCategory e `Frases` ou `Historico`:
     - `FlatList` de altura total do card, `key="phrases"` / `"history"`, `numColumns={1}`.
     - `data`: `savedPhrases` ou `phraseHistory` (historico em ordem decrescente de `spokenAt`).
     - `renderItem`: `<PhraseCard text onPress onDelete isAdmin accent />` (novo componente inline).
     - `ListEmptyComponent`: mensagem ("Nenhuma frase salva ainda" / "Nenhuma frase no historico ainda").
   - `PhraseCard`: Pressable grande, padding generoso, texto em `fontSize: 16 * uiScaleFactor`, cor de destaque sutil; botao "X" no canto para admin (apenas Frases, nao historico).

9. Reproducao 1 toque
   - `speakPhraseText(text: string)`: stop anterior, `Speech.speak` em pt-BR com `rate`/`pitch`, `onError` toast, e no `onDone`/`onStopped` invoca `recordHistory(text)`.
   - `recordHistory(text)`: normaliza; cria `HistoryPhrase { id: history-<Date.now()>, text, spokenAt: ISO }`; `setPhraseHistory(prev => [novo, ...prev.filter(item => item.text.toLowerCase() !== normalized.toLowerCase())].slice(0, PHRASE_HISTORY_MAX))`.

10. Integracao com `handlePlay` existente
    - Ao final de `handlePlay` (apos construir o texto), chamar `speakPhraseText(text)` ou replicar a mesma gravacao de historico no `onDone`. Nao gravar historico vazio.

11. Editor admin (`configSection === 'frases'`)
    - Adicionar `'frases'` em `ConfigSection`.
    - Novo `ConfigNavItem` "Frases" com icone `💬`.
    - Card semelhante ao Vocabulario: lista de `savedPhrases`, cada linha com texto (ou TextInput inline quando `editingPhraseId`), botoes Editar, Salvar (so quando editando), Remover.
    - Rodape: TextInput + botao "Adicionar" (valida nao-vazio, dedup case-insensitive, limite `SAVED_PHRASES_MAX`).
    - Mensagem de bloqueio quando nao-admin.

12. UX e acessibilidade
    - Labels descritivos (`accessibilityLabel` "Falar frase <texto>", "Remover frase", "Editar frase").
    - Respeitar `uiScaleFactor` e `isHighContrast`.
    - `normalizedPhrase` permanece independente — reproducao de frase pronta nao altera `selectedSymbols` (simplicidade: so fala e loga).

13. Testes
    - `renders defaults after first mount`: monta o app, navega para categoria "Frases", verifica que pelo menos uma frase padrao aparece.
    - `tapping a saved phrase speaks and records history`: mocka `Speech.speak` (chamar `onDone`), toca uma frase pronta, verifica que entra no historico.
    - `history persists across reload`: pre-seed AsyncStorage com historico, monta app, navega para "Historico", verifica que item aparece.
    - Manter testes existentes passando (core vocab, basic app).

14. Fechamento
    - `npm run lint` sem erros.
    - `npm run test -- --runInBand`: todos os testes novos passando; regressoes pre-existentes nao pioram.
    - Escrever `SUMMARY.md` e atualizar `STATE.md`.

## Criterios de Aceite (UAT)
1. Usuario (nao-admin) toca a categoria "Frases", ve uma lista pre-instalada em pt-BR e toca uma frase — ouve imediatamente sem passos adicionais.
2. Cuidador entra no editor admin "Frases", adiciona uma nova frase; ao voltar para a categoria "Frases", a frase nova aparece.
3. Apos falar uma frase no fluxo principal (composer) OU tocar uma frase pronta, ela aparece no topo da categoria "Historico".
4. Tocar uma frase do historico reproduz a voz novamente e mantem a frase no topo (mais recente).
5. Apos reiniciar o app, tanto frases prontas (editadas pelo cuidador) quanto historico permanecem.
6. `npm run lint` e `npm run test -- --runInBand` concluem sem erros novos.

## Verificacao
- Validacao automatizada:
  - `npm run lint`
  - `npm run test -- --runInBand`
- Validacao manual (recomendada ao ligar o dispositivo):
  - Abrir app -> categoria Frases -> tocar frase -> ouvir.
  - Compor frase no fluxo normal -> ouvir -> conferir categoria Historico.
  - Modo admin -> editor Frases -> adicionar/editar/remover -> conferir lista.
  - Reiniciar app -> conferir persistencia de ambos.

## Riscos
- `Speech.speak` `onDone` nao dispara em alguns dispositivos; historico poderia nao gravar.
- Lista crescendo sem limite em caso de bug no cap.
- Duplicatas de texto por variacao de whitespace/case no historico.
- Performance caso usuario acumule muitas frases — `SavedPhrase` e texto leve, `SAVED_PHRASES_MAX = 30` evita cauda longa.

## Mitigacoes
- Tambem chamar `recordHistory` em `onStopped` como rede adicional. Fallback: gravar no momento em que `Speech.speak` e chamado (antes do async result) — opta-se por registrar imediatamente apos `Speech.speak` nao falhar, garantindo consistencia.
- `slice(0, PHRASE_HISTORY_MAX)` aplicado em cada atualizacao.
- Normalizar `trim()` + colapsar whitespace antes do dedup, comparar em lowercase.

## Dependencias
- Depends on: Phase 12 (Vocabulario Core) — concluida.
- Desbloqueia: Phase 16 (rotina visual, que consome frases/historico indiretamente).
