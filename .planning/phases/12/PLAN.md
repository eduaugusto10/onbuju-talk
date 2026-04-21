# PLAN - Phase 12 - Vocabulario Core e Motor Planning

## Objetivo
Introduzir uma faixa fixa de vocabulario essencial (motor planning) visivel em todas as telas de montagem, com conjunto padrao pre-instalado em pt-BR e editor no modo admin para adicionar, remover e reordenar palavras do nucleo.

## Requisitos Mapeados
- COMM-01: palavras-nucleo sempre na mesma posicao independente de navegacao entre categorias.
- COMM-02: cuidador configura quais palavras compoem o core e em qual ordem, com padrao pre-instalado.

## Escopo
- Adicionar constante `DEFAULT_CORE_VOCABULARY` em `src/constants.ts` (quero, nao, sim, mais, parar, ajuda, mae, pai).
- Adicionar chave `coreVocabulary` em `STORAGE_KEYS` e persistencia AsyncStorage.
- Hidratar `coreVocabulary` no boot com fallback para o padrao.
- Renderizar `CoreVocabBar` horizontal entre a grade de simbolos e o composer, sempre visivel no fluxo principal.
- Tap em palavra do core adiciona um `SymbolItem` com `id: core-<slug>` e `label` ao `selectedSymbols`.
- Tratar caso `imageUrl` vazio na `selectedList` do composer para renderizar chip textual.
- Adicionar secao "Vocabulario" na configuracao (`ConfigSection`) para edicao pelo cuidador: adicionar, remover, reordenar (up/down).
- Normalizacao: ignorar entradas vazias, limitar a 12 palavras, deduplicar por label (case-insensitive).

## Fora de Escopo
- Busca automatica de imagens ARASAAC para as palavras do core (fase futura).
- Gestos de drag-and-drop para reordenacao (usar botoes up/down para simplicidade).
- Migracao de favoritos para core.
- Edicao por usuario (apenas admin).

## Arquivos Alvo
- `src/constants.ts` (nova constante)
- `src/App.tsx` (state, hydrate, persist, UI core bar, editor admin)
- `src/__tests__/App.test.tsx` (cobertura core bar default + tap)

## Plano de Implementacao

1. Constantes
   - Adicionar `DEFAULT_CORE_VOCABULARY: string[]` em `src/constants.ts`.
   - Valores: `['quero', 'nao', 'sim', 'mais', 'parar', 'ajuda', 'mae', 'pai']`.
   - Adicionar `CORE_VOCABULARY_MAX` = 12.

2. Persistencia e estado
   - Adicionar chave `coreVocabulary: 'core_vocabulary'` em `STORAGE_KEYS`.
   - Adicionar `const [coreVocabulary, setCoreVocabulary] = useState<string[]>(DEFAULT_CORE_VOCABULARY)`.
   - Adicionar `AsyncStorage.getItem(STORAGE_KEYS.coreVocabulary)` ao Promise.all do boot.
   - Fazer parse: se lista valida, usar; senao, manter default.
   - Adicionar `useEffect` para persistir JSON em cada mudanca.

3. Core bar UI
   - Novo componente inline `CoreVocabBar` que recebe `{ words: string[], onTap: (word: string) => void, highContrast: boolean, uiScaleFactor: number }`.
   - Renderizar `ScrollView horizontal` com botoes grandes e consistentes (posicao fixa garantida por ser o proprio container — ordem e o que o cuidador configurou).
   - Cada botao: texto em caixa alta, padding generoso, feedback visual de toque.
   - Inserir entre `listCard` (grade) e `composerCard` (composer) no render principal.
   - Pular render quando `coreVocabulary` estiver vazio.

4. Tap handler
   - Ao tocar palavra do core, chamar `addSymbol({ id: `core-${slug}`, label: word, imageUrl: '', category: 'core' })`.
   - Slug: `word.toLowerCase().trim().replace(/\s+/g, '-')`.
   - Limpar `normalizedPhrase` se vazio para recomposicao automatica.

5. Composer resiliente
   - Em `selectedSymbols.map` do composer, se `symbol.imageUrl` for vazio, renderizar um chip textual com `symbol.label` em caixa alta no lugar do `CachedImage`.
   - Manter `onLongPress` para remover.
   - Estilo do chip textual consistente com o dos botoes do core bar.

6. Editor admin (`configSection === 'vocabulario'`)
   - Adicionar `'vocabulario'` em `ConfigSection` type.
   - Adicionar `ConfigNavItem` "Vocabulario" com icone e handler para `setConfigSection('vocabulario')`.
   - Card da secao com:
     - Titulo e hint curta.
     - Lista de palavras atuais, cada item com:
       - Label editavel inline OU apenas texto (manter simples: apenas texto + botoes).
       - Botao mover para cima (desabilitado se for primeiro).
       - Botao mover para baixo (desabilitado se for ultimo).
       - Botao remover.
     - `TextInput` + botao "Adicionar" para nova palavra, validando dedup/limit.
     - Botao "Restaurar padrao" (confirma substituicao do conjunto atual pelo `DEFAULT_CORE_VOCABULARY`).
   - Acesso limitado: mostrar mensagem se nao-admin (fallback para login no painel seguranca).

7. Acessibilidade e alto contraste
   - Labels de acessibilidade em botoes do core bar (`accessibilityLabel: "Adicionar palavra <word>"`).
   - Respeitar `uiScaleFactor` no tamanho da fonte dos botoes.
   - Estilos alternativos para `isHighContrast`.

8. Testes
   - Adicionar teste: apos iniciar o app (pular intro), verificar que pelo menos `quero` e `ajuda` estao visiveis na tela como botoes de core.
   - Adicionar teste: tocar em `quero` aumenta a lista de simbolos selecionados.
   - Manter testes existentes passando.

9. Fechamento
   - `npm run lint` e `npm run test -- --runInBand` sem erros.
   - Escrever `SUMMARY.md` com entregas e verificacoes.
   - Atualizar `STATE.md` com Phase 12 concluida.

## Criterios de Aceite (UAT)
1. Ao abrir o app pela primeira vez, a faixa de vocabulario core aparece com 8 palavras em pt-BR na ordem padrao.
2. Ao trocar de categoria (Favoritos, Tudo, etc.), a faixa permanece visivel e com as mesmas palavras na mesma ordem.
3. Ao tocar em uma palavra do core, ela e adicionada a area de selecao e participa da frase reproduzida por voz.
4. No modo admin, o cuidador consegue:
   - Adicionar uma palavra nova que imediatamente aparece no fim da faixa.
   - Remover uma palavra que desaparece da faixa.
   - Reordenar uma palavra usando setas up/down.
   - Restaurar o conjunto padrao.
5. Apos reiniciar o app, o vocabulario core editado permanece.
6. `npm run lint` e `npm run test -- --runInBand` concluem sem erros.

## Verificacao
- Validacao manual:
  - Iniciar app -> confirmar faixa de core visivel.
  - Navegar entre categorias -> confirmar faixa inalterada.
  - Tocar palavras do core -> confirmar adicao na area de selecao, ouvir a frase.
  - Entrar como admin -> editor de vocabulario -> adicionar, remover, reordenar, restaurar.
  - Reiniciar app -> confirmar persistencia.
- Validacao automatizada:
  - `npm run lint`
  - `npm run test -- --runInBand`

## Riscos
- Core bar quebrar layout em telas pequenas ou densidade visual alta.
- Palavras com acento (`mae`, `nao`) falharem em TTS se nao normalizadas.
- Duplicatas por variacao de case no editor.
- Composer quebrar ao receber `SymbolItem` sem `imageUrl`.

## Mitigacoes
- `ScrollView horizontal` para a faixa (sem quebra de linha).
- Usar forma sem diacriticos nos defaults (`nao`, `mae`, `pai`) para consistencia com o resto do app.
- Normalizar para lowercase antes de comparar/adicionar.
- Renderizar chip textual no composer quando `imageUrl` estiver vazio.

## Dependencias
- Depends on: Phase 11 (Configuracao de Densidade do Grid de Imagens) — concluida.
- Desbloqueia: Phase 13 (Frases Prontas e Historico) — que depende de um vocabulario estavel.
