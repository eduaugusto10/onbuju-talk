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
- [x] **Phase 16: Rotina Visual e Polimento da Milestone** - Rotina do dia e regressao final sem quebras. ✓

## Progress Table (Milestone 4)

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 12. Vocabulario Core e Motor Planning | 1/1 | Complete | 2026-04-21 |
| 13. Frases Prontas e Historico | 1/1 | Complete | 2026-04-21 |
| 14. Simbolos Pessoais e Categorias Customizadas | 1/1 | Complete | 2026-04-21 |
| 15. Voz Gravada do Cuidador | 1/1 | Complete | 2026-04-21 |
| 16. Rotina Visual e Polimento da Milestone | 1/1 | Complete | 2026-04-21 |

## Milestone 5 - Refatoracao de Design no Estilo iOS
- Milestone 5 - Refatoracao de Design no Estilo iOS (shipped 2026-04-21) -> ver arquivo: `.planning/milestones/v5-ROADMAP.md`

<details>
<summary>Phases arquivadas (expandir para ver detalhes historicos)</summary>

### Phase 17 - Design System iOS (Tokens e Primitivos)
- Objetivo: estabelecer o design system iOS do projeto — tokens de cor, tipografia, espacamento, raios e sombras — e componentes primitivos reutilizaveis.
- Entregas:
  - `src/theme.ts` expandido com tokens iOS: `colors` (systemBlue, labels, fills, groupedBackground, systemGrays), `typography` (largeTitle, title1-3, body, callout, footnote, caption com pesos), `radii` (8/12/16), `spacing` (4/8/12/16/20/24), `shadows` (iOS-like sutil).
  - Novo modulo `src/ui/` ou estilos inline compartilhados com primitivos: `IOSButton` (filled/tinted/plain), `IOSCard`, `IOSListSection`, `IOSListRow`, `IOSSectionHeader`, `IOSBottomSheet` base.
  - Instalar `expo-haptics` e `expo-blur` via `npx expo install`; adicionar plugins ao `app.json`.
  - Documentar uso dos tokens no topo do `theme.ts` com exemplos pt-BR.
- Requisitos mapeados: DS-01, DS-02, DS-03
- Criterios de Sucesso:
  1. `src/theme.ts` exporta objetos `colors`, `typography`, `radii`, `spacing`, `shadows` com valores iOS-aligned.
  2. Pelo menos um componente existente (ex.: header) adota os novos tokens como prova de conceito.
  3. `expo-haptics` e `expo-blur` instalados e com plugins registrados em `app.json`.
  4. `npm run lint` e `npm run test` sem novos erros.
- **UI hint**: yes

### Phase 18 - Tela Principal estilo iOS
- Objetivo: migrar header, categorias, busca, grid de simbolos e composer para a estetica iOS usando os tokens da Phase 17.
- Entregas:
  - Header como nav bar iOS (titulo grande ou centralizado; botoes com estetica iOS; admin badge com pill style).
  - Barra de categorias como Segmented Control / pills iOS (active = preenchido com `systemBlue` / tinted; inactive = `secondarySystemFill`).
  - Search field em estilo iOS (background `systemGray6`, cantos 10px, icone de lupa dentro do campo, botao clear com `xmark.circle.fill`-like).
  - `SymbolCard` refatorado com raio 14px, `shadow.sm`, tap opacity (`pressable opacity 0.7`), favorite star como overlay circular iOS.
  - Core vocab bar com chips iOS tinted.
  - Composer card com fundo `systemGroupedBackgroundSecondary`, botoes em variantes (Filled = Gerar/Ouvir, Plain = Deletar).
- Depends on: Phase 17
- Requisitos mapeados: MAIN-01, MAIN-02, MAIN-03, MAIN-04, MAIN-05
- Criterios de Sucesso:
  1. Header, categorias, busca, grid e composer renderizam visualmente no estilo iOS em iPhone size (iOS simulator ou Android small screen).
  2. Tap em card produz feedback visual coerente com iOS (opacidade).
  3. Segmented control distingue selecionado com clareza.
  4. Paleta respeita alto contraste quando `contrastMode === 'alto'`.
  5. Fluxo principal (selecionar, gerar, ouvir, deletar) continua funcionando.
- **UI hint**: yes

### Phase 19 - Sheets e Modais iOS
- Objetivo: substituir os `Modal` tradicionais por bottom sheets estilo iOS com grabber e backdrop desfocado.
- Entregas:
  - Componente `IOSBottomSheet` reutilizavel com: container ancorado no bottom, safe-area inset, grabber (`<View />` 36x5px com cantos arredondados no topo), padding interno, max-height ~85%, header com botoes "Cancelar"/"Pronto" (ou "Salvar" quando aplicavel).
  - Backdrop usando `BlurView` (expo-blur) com intensity 60-80 + overlay semi-transparente; tap no backdrop fecha (dismissivel pelo grabber tambem).
  - Aplicar `IOSBottomSheet` em: config modal, symbol draft modal, audio recorder modal, naming group modal.
  - Header dos sheets consistente: "Cancelar" a esquerda, titulo centralizado, "Pronto"/"Salvar" a direita (cor `systemBlue`, bold no primary).
- Depends on: Phase 17
- Requisitos mapeados: SHEET-01, SHEET-02, SHEET-03
- Criterios de Sucesso:
  1. Todos os modais abrem ancorados no bottom com grabber visivel.
  2. Backdrop desfocado aparece em vez de overlay solido.
  3. Tap em "Cancelar" fecha o sheet descartando edicoes; "Pronto"/"Salvar" persiste.
  4. Sheets respeitam safe-area bottom (nenhum conteudo atras do home indicator).
  5. Fluxos dos modais continuam funcionais (admin login, criar simbolo, gravar voz, salvar grupo).
- **UI hint**: yes

### Phase 20 - Config "Ajustes" iOS + Haptic Feedback
- Objetivo: transformar o modal de configuracao em uma lista agrupada estilo iOS Ajustes, com switches nativos e feedback tatil nos toques principais.
- Entregas:
  - Reformular config modal para layout "inset grouped list": secoes agrupadas com header pequeno em caixa alta (ex.: "VOZ", "ACESSIBILIDADE", "CUIDADOR", "FRASES", "SIMBOLOS", "CATEGORIAS", "VOCABULARIO", "ROTINA"), cards agrupados com rows separados por hairlines (`StyleSheet.hairlineWidth`).
  - `IOSListRow` com layout padrao: texto a esquerda, valor/accessory (Switch/chevron/count) a direita.
  - Substituir `OptionChip` binarios (feedback visual, contraste) por `Switch` nativo (cor `systemBlue`).
  - Adicionar chevron `>` em rows que levam a subsecoes (editores de frases/simbolos/categorias/rotina) — manter conteudo inline no mesmo sheet, apenas sinal visual de affordance.
  - Integrar `expo-haptics`: `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)` em: adicionar simbolo ao composer, tap em frase pronta/historico, toggle passo de rotina, tap em "Ouvir"/"Gerar"/"Salvar".
  - Fallback para no-op em plataformas/ambientes sem haptics.
- Depends on: Phase 17, Phase 19
- Requisitos mapeados: CFG-01, CFG-02, CFG-03, FDB-01
- Criterios de Sucesso:
  1. Config exibe secoes agrupadas com headers em UPPERCASE pt-BR.
  2. Toggles binarios usam `Switch` nativo.
  3. Rows tem hairlines internas e cantos arredondados no primeiro/ultimo item da secao.
  4. Toques principais disparam haptic feedback em iOS; nao quebra em Android.
  5. Preferencias continuam persistindo.
- **UI hint**: yes

### Phase 21 - Regressao, Polimento e Release
- Objetivo: regressao completa dos fluxos v1-v4, corrigir bugs visuais detectados e preparar release.
- Entregas:
  - Regressao manual e automatizada de todos os fluxos v1-v4 (checklist em `RELEASE-CHECKLIST.md`).
  - Correcoes de bugs visuais ou de layout detectados durante regressao.
  - Consistencia final em alto contraste.
  - Atualizacao de testes se UI mudou ids/labels (ex.: switches alteram labels acessiveis).
  - `npm run lint` e `npm run test -- --runInBand` sem novas falhas.
  - `RELEASE-CHECKLIST.md` atualizado com secao v5 e regressao completa.
- Depends on: Phase 18, Phase 19, Phase 20
- Requisitos mapeados: REG-01
- Criterios de Sucesso:
  1. Todos os fluxos v1-v4 passam regressao manual sem bugs visuais ou funcionais.
  2. Test suite passa (com os 4 pre-existentes herdados ou corrigidos se escopo permitir).
  3. `npm run lint` limpo.
  4. Release checklist marcado para v5.
  5. Sem regressao em acessibilidade (labels, contrast mode, ui scale).
- **UI hint**: yes

## Phase Summary (Milestone 5)

- [x] **Phase 17: Design System iOS (Tokens e Primitivos)** - Tokens de cor/tipografia/espacamento iOS e componentes primitivos. ✓
- [x] **Phase 18: Tela Principal estilo iOS** - Header, categorias, busca, grid e composer em estetica iOS. ✓
- [x] **Phase 19: Sheets e Modais iOS** - Bottom sheets com grabber e blur backdrop. ✓
- [x] **Phase 20: Config "Ajustes" iOS + Haptic Feedback** - Inset grouped list, switches nativos, haptics. ✓
- [x] **Phase 21: Regressao, Polimento e Release** - Regressao completa e preparacao de entrega. ✓

## Progress Table (Milestone 5)

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 17. Design System iOS (Tokens e Primitivos) | 1/1 | Complete | 2026-04-21 |
| 18. Tela Principal estilo iOS | 1/1 | Complete | 2026-04-21 |
| 19. Sheets e Modais iOS | 1/1 | Complete | 2026-04-21 |
| 20. Config "Ajustes" iOS + Haptic Feedback | 1/1 | Complete | 2026-04-21 |
| 21. Regressao, Polimento e Release | 1/1 | Complete | 2026-04-21 |

</details>

## Milestone 6 - Redesign Visual Calmo

Goal: aplicar ao app real a direcao de design validada nos 4 sketches — paleta calma "Salvia & Creme", layout enxuto, novos cards de pictograma, compositor reorganizado e configuracoes em drill-down — substituindo a estetica iOS azul da v5, que competia visualmente com os pictogramas. Escopo exclusivamente visual/UX: nenhuma feature funcional nova; toda a funcionalidade v1-v4 e preservada. Restricao dura mantida: simplicidade acima de riqueza de features (publico autista). Numeracao continua a partir da Phase 22.

Fonte de design: decisoes validadas e empacotadas no skill `sketch-findings-fala` (`.claude/skills/sketch-findings-fala/`), com sketches interativos preservados em `.planning/sketches/`. O downstream planning deve consumir esse skill (tema vencedor em `sources/themes/default.css`, referencias em `references/`).

### Phase 22 - Sistema de Tema "Salvia & Creme"
- Objetivo: estabelecer o sistema de tema calmo de baixo estimulo sensorial como fundacao de design — paleta terrosa, fonte Nunito e 3 temas selecionaveis — substituindo a estetica iOS azul. Todas as demais fases da milestone dependem desta.
- Entregas:
  - `src/theme.ts` reescrito com a paleta "Salvia & Creme": salvia (ativo/selecionado), ouro (acao Gerar IA), terracota (acao Ouvir), creme (fundo e cards), texto quase-preto quente; remocao do azul iOS `#007AFF` como cor primaria. Tokens portados de `sources/themes/default.css`.
  - Fonte Nunito carregada e exposta como token tipografico (pesos 400-800); nenhuma familia de fonte hardcoded fora dos tokens.
  - 3 temas definidos como conjuntos de tokens: "Salvia & Creme" (padrao), "Terracota" e "Sereno Escuro" (modo escuro calmo que substitui o alto-contraste preto/amarelo agressivo).
  - Seletor de tema na configuracao do cuidador com persistencia em AsyncStorage (nova chave em `STORAGE_KEYS`, hidratada no boot `useEffect`).
  - Raios generosos (16-30px) e sombras baixas/suaves tingidas de quente nos tokens.
- Depends on: nada (primeira fase da milestone)
- Requisitos mapeados: VIS-01, VIS-02, VIS-03
- Criterios de Sucesso:
  1. App inteiro renderiza com a paleta Salvia & Creme; nenhum elemento exibe o azul iOS `#007AFF` como cor primaria.
  2. Textos do app aparecem na fonte Nunito arredondada em vez da fonte de sistema.
  3. Cuidador abre a configuracao, escolhe entre os 3 temas e o app reflete a troca imediatamente.
  4. Apos reiniciar o app, o tema escolhido pelo cuidador permanece aplicado.
- **UI hint**: yes

### Phase 23 - Tela Principal Redesenhada
- Objetivo: redesenhar a tela principal com o layout enxuto validado — sem slogan, sem barra de vocabulario competindo, cards de pictograma com cor de categoria, compositor com hierarquia "Ouvir heroi" e remocao de figura em 1 toque.
- Entregas:
  - Layout enxuto: remocao do slogan e da barra de vocabulario separada; vocabulario core integrado a grade sem competir como segunda barra.
  - `SymbolCard` refeito no estilo validado: card limpo com a cor da categoria no bloco atras do pictograma e o rotulo em texto abaixo (sem etiqueta colorida).
  - Compositor com hierarquia "Ouvir heroi": botao "Ouvir" dominante; botao "Gerar (IA)" rotulado e visivel porem menor, como acao de apoio (preservando-o no view padrao por ser funcionalidade core).
  - Remocao de figura selecionada com 1 toque na propria figura; controle discreto "limpar" visivel apenas quando ha figuras, apagando todas.
  - Aplicacao dos tokens da Phase 22 a header, busca, categorias e grade.
- Depends on: Phase 22
- Requisitos mapeados: TELA-01, TELA-02, TELA-03, TELA-04
- Criterios de Sucesso:
  1. Tela principal abre sem slogan e sem barra de vocabulario separada; o vocabulario core continua acessivel integrado.
  2. Cada card de pictograma mostra a cor da categoria no bloco atras do simbolo, com rotulo em texto abaixo.
  3. No compositor, "Ouvir" e visualmente o botao dominante e "Gerar (IA)" aparece menor mas rotulado e acionavel.
  4. Usuario toca uma figura selecionada e ela e removida; o controle "limpar" so aparece quando ha figuras e apaga todas de uma vez.
  5. Fluxo principal (buscar, selecionar, gerar, ouvir, salvar) continua funcionando sem regressao.
- **UI hint**: yes

### Phase 24 - Configuracoes Agrupadas com Drill-down
- Objetivo: reorganizar a tela de configuracoes das 10 abas planas para um inicio agrupado em 3 grupos com navegacao drill-down, eliminando listas densas e expondo o gating de cuidador de forma clara.
- Entregas:
  - Inicio de configuracoes com 3 grupos — "App", "Conteudo da crianca" e "Cuidador" — substituindo as 10 abas planas.
  - Navegacao drill-down: cada item abre sua propria tela com botao voltar (troca de estado de View, sem React Navigation); eliminacao das listas "rotulo + 3 botoes espremidos".
  - Gating por grupo: cuidador deslogado ve apenas o grupo "App" disponivel; os grupos "Conteudo da crianca" e "Cuidador" exibem indicador de bloqueio e pedem senha.
  - Aplicacao dos tokens da Phase 22 a todas as telas de configuracao.
- Depends on: Phase 22
- Requisitos mapeados: CFG-01, CFG-02, CFG-03
- Criterios de Sucesso:
  1. A tela de configuracoes abre com 3 grupos ("App", "Conteudo da crianca", "Cuidador") em vez de 10 abas planas.
  2. Tocar um item de configuracao abre sua propria tela dedicada com botao voltar; nenhuma lista densa de "rotulo + 3 botoes" permanece.
  3. Com o cuidador deslogado, apenas o grupo "App" e acessivel; os outros mostram indicador de bloqueio e pedem senha ao serem tocados.
  4. Todos os ajustes existentes (voz, acessibilidade, editores) continuam acessiveis e funcionais via drill-down.
- **UI hint**: yes

### Phase 25 - Regressao e Release
- Objetivo: regressao completa dos fluxos v1-v4 sob o novo design, correcao de bugs visuais detectados e preparacao do release da milestone v6.
- Entregas:
  - Regressao manual e automatizada de todos os fluxos v1-v4 (buscar, selecionar, gerar, ouvir, salvar, frases prontas, historico, simbolos pessoais, voz gravada, rotina, categorias, admin) sob o tema novo.
  - Correcao de bugs visuais ou de layout detectados durante a regressao, incluindo verificacao nos 3 temas e respeito a escala de UI existente.
  - Atualizacao de testes se a UI mudou ids/labels acessiveis.
  - `npm run lint` e `npm run test` sem novas falhas.
  - `RELEASE-CHECKLIST.md` atualizado com secao v6 e regressao completa.
- Depends on: Phase 23, Phase 24
- Requisitos mapeados: REG-01
- Criterios de Sucesso:
  1. Todos os fluxos v1-v4 passam regressao manual sem bugs visuais ou funcionais.
  2. `npm run lint` limpo e `npm run test` sem novas falhas alem das pre-existentes herdadas.
  3. Os 3 temas (Salvia & Creme, Terracota, Sereno Escuro) renderizam consistentemente nos fluxos principais.
  4. Release checklist atualizado e marcado para v6.

## Phase Summary (Milestone 6)

- [ ] **Phase 22: Sistema de Tema "Salvia & Creme"** - Paleta terrosa de baixo estimulo, fonte Nunito e 3 temas em `src/theme.ts`.
  - **Plans:** 3 plans (3 waves)
  - [x] 22-01-PLAN.md -- Reescrever src/theme.ts com 3 temas Salvia & Creme + instalar fonte Nunito
  - [x] 22-02-PLAN.md -- Integrar tema em App.tsx: estado themeName, makeStyles factory, fonte no boot, shell
  - [ ] 22-03-PLAN.md -- Seletor de 3 temas na config + verificacao humana
- [ ] **Phase 23: Tela Principal Redesenhada** - Layout enxuto, cards com cor de categoria, compositor Ouvir-heroi, apagar em 1 toque.
- [ ] **Phase 24: Configuracoes Agrupadas com Drill-down** - 10 abas planas viram 3 grupos com navegacao drill-down e gating claro.
- [ ] **Phase 25: Regressao e Release** - Regressao dos fluxos v1-v4 sem quebras e preparacao de release.

## Progress Table (Milestone 6)

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 22. Sistema de Tema "Salvia & Creme" | 2/3 | In Progress | - |
| 23. Tela Principal Redesenhada | 0/0 | Not started | - |
| 24. Configuracoes Agrupadas com Drill-down | 0/0 | Not started | - |
| 25. Regressao e Release | 0/0 | Not started | - |
