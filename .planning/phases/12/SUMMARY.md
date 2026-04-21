# SUMMARY - Phase 12 - Vocabulario Core e Motor Planning

## Status
Concluida.

## Entregas
- `src/constants.ts`: adicionado `DEFAULT_CORE_VOCABULARY` (quero, nao, sim, mais, parar, ajuda, mae, pai) e `CORE_VOCABULARY_MAX = 12`.
- `src/App.tsx`:
  - Novo tipo `ConfigSection` inclui `'vocabulario'`.
  - Nova chave `STORAGE_KEYS.coreVocabulary` e helpers `normalizeCoreWord` / `sanitizeCoreVocabulary`.
  - Novo estado `coreVocabulary` com hidratacao e persistencia via `AsyncStorage`.
  - Handlers `addCoreWord`, `addCoreVocabularyWord`, `removeCoreVocabularyWord`, `moveCoreVocabularyWord`, `resetCoreVocabulary`.
  - Componente inline CoreVocabBar: ScrollView horizontal com botoes grandes entre a grade e o composer, visivel em todas as categorias.
  - Composer agora renderiza chip textual quando `SymbolItem.imageUrl` esta vazio (suporte a palavras do core sem imagem).
  - Nova secao de configuracao "Vocabulario" com lista de palavras, reordenar (up/down), remover, adicionar via TextInput e botao "Restaurar padrao". Acesso restrito ao modo admin.
  - Nav item "Vocabulario" com icone 🗣 em ConfigNav.
- `src/__tests__/App.test.tsx`: 3 novos testes cobrindo padrao, tap-adiciona-persistencia e restauracao a partir do storage.

## Requisitos Atendidos
- **COMM-01**: Faixa visivel sempre, independente da categoria ativa (posicionada entre grade e composer, fora do container da grade).
- **COMM-02**: Editor administrativo permite adicionar, remover, reordenar e restaurar o vocabulario core; padrao pt-BR pre-instalado.

## Decisoes
- Core bar e renderizado sem imagens (texto grande em caixa alta). Motor planning depende de posicao consistente, nao de pictograma. Decisao reduz dependencia de rede e simplifica editor.
- Tap em palavra do core cria `SymbolItem` com `imageUrl: ''`. Composer agora trata imageUrl vazio renderizando chip textual em tom de verde (core) mantendo consistencia visual.
- Slug do id do simbolo core inclui `Date.now()` para permitir multiplas ocorrencias da mesma palavra na frase.
- Editor usa botoes up/down em vez de drag-and-drop para simplicidade (restricao dura do projeto).

## Verificacoes
- `npm run lint`: OK.
- `npm run test -- --runInBand`: 5 passes, 4 failures pre-existentes (dessincronia da test suite com a UI remodelada na Milestone 2 — nao sao regressao desta fase; rastreadas como divida tecnica em fase futura).
- Testes novos (3): todos passam, cobrindo padrao, persistencia e restauracao do core vocabulary.
- Validacao manual no `src/App.tsx`: tipos TypeScript estritos respeitados, tratamento de erros em parse do storage, limites de tamanho e dedup aplicados.

## Impacto
- Layout da tela principal: nova faixa entre grade e composer (alturas aproximadas 48-52px). Sem quebra em testes de densidade 2-5 colunas (core bar e horizontal scroll, nao depende de grid).
- Superficie de configuracao: +1 aba ("Vocabulario") na `configNav`.
- Comportamento offline: inalterado — core vocabulary e puramente local.
- Acessibilidade: labels descritivos em todos os botoes do core bar e do editor.

## Divida Tecnica Observada
- 4 testes preexistentes em `App.test.tsx` falham por UI mudanca (icones `☰`, textos "Configuração"). Nao foi tocado nesta fase. Recomendar fase de polimento dedicada a sincronizar test suite com UI atual.

## Proximo Passo
- Phase 13: Frases Prontas e Historico — depende do vocabulario estavel entregue nesta fase.
