# ROADMAP

- Milestone 1 - Estabilizacao Mobile (shipped) -> ver arquivo: `.planning/milestones/v1-ROADMAP.md`

## Milestone 2 - Remodelagem UX e Acessibilidade

### Phase 5 - Design System e Estrutura da Tela Principal
- Objetivo: remodelar a tela principal com hierarquia visual clara e componentes consistentes.
- Entregas:
  - Novo layout base (header, busca, categorias, grade, frase e acoes).
  - Padronizacao de espacos, tipografia e componentes interativos.
  - Ajustes para legibilidade em diferentes tamanhos de tela.
- Verificacao:
  - Interface principal validada visualmente em iOS.
  - Sem cortes de texto nem sobreposicoes.

### Phase 6 - Remodelagem da Configuracao e Personalizacao
- Objetivo: enriquecer a tela de configuracao com opcoes uteis e melhor usabilidade.
- Entregas:
  - Nova tela/secoes de configuracao com organizacao por blocos.
  - Opcoes de acessibilidade e personalizacao (escala visual, contraste, feedbacks).
  - Fluxos de admin e chave IA mais guiados e intuitivos.
- Depends on: Phase 5
- Verificacao:
  - Configuracao deixa de ser "pobre" e cobre opcoes essenciais de uso.
  - Fluxo admin/IA funcional com menor friccao.

### Phase 7 - Polimento iOS, Regressao e Estabilizacao Final
- Objetivo: validar prioridade iOS, remover regressao e consolidar entrega da milestone.
- Entregas:
  - Ajustes finos de UX iOS e compatibilidade Android.
  - Regressao dos fluxos principais (buscar, selecionar, gerar, ouvir, salvar).
  - Atualizacao de testes e checklist de release.
- Depends on: Phase 6
- Verificacao:
  - `npm run lint` e `npm run test` sem erros.
  - Fluxo principal intacto apos remodelagem.

## Milestone 3 - Experiencia de Abertura (Tela Inicial)
- Milestone 3 - Experiencia de Abertura (Tela Inicial) (shipped) -> ver arquivo: `.planning/milestones/v3-ROADMAP.md`

## Milestone 4 - Comunicacao Pessoal e Rotina Visual

Goal: evoluir o Fala Mobile de montador de frases para ferramenta de comunicacao diaria personalizada, com vocabulario estavel, conteudo familiar (fotos e voz do cuidador) e rotinas visuais. Restricao dura: simplicidade acima de riqueza de features (publico autista). Numeracao continua a partir da Phase 12.

### Phase 12 - Vocabulario Core e Motor Planning
- Objetivo: garantir que palavras essenciais fiquem sempre no mesmo lugar, reforcando o motor planning da crianca, e permitir que o cuidador defina quais palavras compoem esse nucleo.
- Entregas:
  - Faixa fixa de vocabulario core visivel em todas as telas de montagem, independente da categoria selecionada.
  - Conjunto padrao pre-instalado em pt-BR (quero, nao, sim, mais, parar, ajuda, mae, pai).
  - Editor no modo admin para adicionar, remover e reordenar palavras do nucleo.
  - Persistencia local do vocabulario core configurado.
- Requisitos mapeados: COMM-01, COMM-02
- Criterios de Sucesso:
  1. Usuario ve as mesmas palavras-nucleo na mesma posicao ao trocar de categoria.
  2. Cuidador abre o editor e altera a ordem das palavras, e a nova ordem aparece imediatamente na tela principal.
  3. Apos reiniciar o app, o vocabulario core configurado pelo cuidador permanece.
  4. Em instalacao nova, o conjunto padrao em pt-BR ja esta disponivel sem exigir configuracao.
- **UI hint**: yes

### Phase 13 - Frases Prontas e Historico
- Objetivo: permitir comunicacao de um toque com frases pre-montadas pelo cuidador e com frases ditas recentemente.
- Entregas:
  - Tela/secao de frases prontas com reproducao em um toque.
  - Editor no modo admin para adicionar, editar e remover frases prontas.
  - Historico automatico das ultimas frases faladas, com reuso em um toque.
  - Persistencia local das frases prontas e do historico.
- Depends on: Phase 12
- Requisitos mapeados: COMM-03, COMM-04, COMM-05
- Criterios de Sucesso:
  1. Usuario toca uma frase pronta e ouve a frase completa sem passos adicionais.
  2. Cuidador adiciona uma nova frase no editor e ela aparece na tela de frases prontas.
  3. Apos falar uma frase no fluxo principal, ela aparece no topo do historico.
  4. Usuario toca uma frase do historico e a escuta novamente, com a frase mantendo sua ordem de uso mais recente.
  5. Frases prontas e historico permanecem apos reiniciar o app.
- **UI hint**: yes

### Phase 14 - Simbolos Pessoais (Camera, Galeria) e Categorias Customizadas
- Objetivo: permitir que o cuidador adicione fotos familiares como simbolos e organize o acervo em categorias proprias.
- Entregas:
  - Fluxo de criacao de simbolo a partir da camera do dispositivo (captura, recorte simples, rotulo).
  - Fluxo de criacao de simbolo a partir da galeria de fotos (selecao, rotulo).
  - Atribuicao opcional de categoria no momento da criacao.
  - Gerenciador de categorias customizadas (criar, renomear, remover, associar simbolos).
  - Armazenamento local das imagens no FileSystem e metadados em AsyncStorage, seguindo padrao dos services existentes.
- Depends on: Phase 12
- Requisitos mapeados: CONT-01, CONT-02, ORG-03
- Criterios de Sucesso:
  1. Cuidador tira uma foto e, ao final do fluxo, o novo simbolo aparece na grade principal com rotulo.
  2. Cuidador importa uma imagem da galeria e o simbolo resultante e indistinguivel em uso de um simbolo ARASAAC.
  3. Cuidador cria uma categoria customizada e associa simbolos pessoais a ela; a categoria aparece na barra de categorias.
  4. Renomear ou remover uma categoria customizada reflete imediatamente no filtro de categorias.
  5. Simbolos pessoais e categorias customizadas persistem apos reiniciar o app.
- **UI hint**: yes

### Phase 15 - Voz Gravada do Cuidador
- Objetivo: dar ao simbolo a voz de uma pessoa familiar, com fallback transparente para TTS.
- Entregas:
  - Gravacao de audio no editor de simbolo (iniciar, parar, reouvir, regravar, salvar).
  - Vinculacao do audio ao simbolo e reproducao automatica no lugar do TTS quando existir.
  - Fallback transparente para TTS quando o simbolo nao tem audio gravado.
  - Armazenamento local do audio no FileSystem, seguindo padrao de cache dos services.
  - Indicador visual discreto de que um simbolo tem voz gravada.
- Depends on: Phase 14
- Requisitos mapeados: CONT-03, CONT-04
- Criterios de Sucesso:
  1. Cuidador grava audio para um simbolo e, ao selecionar o simbolo, ouve a gravacao em vez do TTS.
  2. Simbolos sem audio continuam reproduzindo via TTS sem nenhuma mudanca perceptivel de fluxo.
  3. Cuidador regrava o audio e a nova gravacao substitui a anterior sem duplicar arquivos.
  4. Audios gravados permanecem apos reiniciar o app.
- **UI hint**: yes

### Phase 16 - Rotina Visual e Polimento da Milestone
- Objetivo: entregar a rotina visual do dia e consolidar a milestone sem regressao nos fluxos principais.
- Entregas:
  - Editor de rotina no modo admin: sequencia ordenada de simbolos com reordenacao.
  - Tela dedicada de rotina do dia com passos visiveis e marcacao de concluido.
  - Persistencia local da rotina e do progresso diario.
  - Regressao dos fluxos principais (buscar, selecionar, gerar, ouvir, salvar, frases prontas, historico, simbolos pessoais, voz gravada).
  - `npm run lint` e `npm run test` sem erros; atualizacao do checklist de release.
- Depends on: Phase 13, Phase 14, Phase 15
- Requisitos mapeados: ORG-01, ORG-02
- Criterios de Sucesso:
  1. Cuidador monta uma rotina com simbolos em ordem e ela aparece na tela de rotina do dia na ordem definida.
  2. Usuario marca um passo como concluido e o passo aparece visualmente diferenciado dos proximos.
  3. Reordenar simbolos no editor reflete imediatamente na tela de rotina do dia.
  4. Progresso da rotina permanece apos reiniciar o app dentro do mesmo dia.
  5. Fluxos principais anteriores continuam funcionando sem regressao apos a integracao final.
- **UI hint**: yes

## Phase Summary (Milestone 4)

- [x] **Phase 12: Vocabulario Core e Motor Planning** - Faixa fixa de palavras-nucleo pt-BR configuravel pelo cuidador. ✓
- [x] **Phase 13: Frases Prontas e Historico** - Banco de frases e reuso de frases recentes em um toque. ✓
- [x] **Phase 14: Simbolos Pessoais e Categorias Customizadas** - Camera, galeria e categorias do cuidador. ✓
- [x] **Phase 15: Voz Gravada do Cuidador** - Audio familiar sobrepondo TTS com fallback transparente. ✓
- [ ] **Phase 16: Rotina Visual e Polimento da Milestone** - Rotina do dia e regressao final sem quebras.

## Progress Table (Milestone 4)

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 12. Vocabulario Core e Motor Planning | 1/1 | Complete | 2026-04-21 |
| 13. Frases Prontas e Historico | 1/1 | Complete | 2026-04-21 |
| 14. Simbolos Pessoais e Categorias Customizadas | 1/1 | Complete | 2026-04-21 |
| 15. Voz Gravada do Cuidador | 1/1 | Complete | 2026-04-21 |
| 16. Rotina Visual e Polimento da Milestone | 0/0 | Not started | - |
