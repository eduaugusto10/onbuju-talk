# Phase 23: Tela Principal Redesenhada - Context

**Gathered:** 2026-05-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Reestiliza a tela principal do app (header, barra de categorias, busca, grade de
pictogramas + card, vocabulario core e compositor de frase) aplicando a direcao
"Salvia & Creme" validada nos sketches, consumindo os tokens de tema da fase 22.
Tambem fecha o gap VIS-02 (fonte Nunito) aplicando os tokens `theme.typography.*`
aos textos reestilizados. NAO inclui a tela de configuracoes (fase 24).

Fonte de design: skill `sketch-findings-fala` — em especial
`references/tela-principal.md`, `references/fundamentos-visuais.md` e os HTMLs
em `sources/001-tela-paleta/`, `sources/002-card-pictograma/`, `sources/003-compositor-frase/`.

</domain>

<decisions>
## Implementation Decisions

### Estrategia de restyling
- O restyling e quebrado em planos POR REGIAO da tela (header / categorias+busca / grade+card / compositor), para ser revisavel — nao um plano monolitico.
- Todo texto reestilizado adota os tokens `theme.typography.*` (que carregam `fontFamily` da Nunito). Isso FECHA o gap VIS-02 da fase 22 naturalmente — a fonte Nunito passa a ser de fato exibida.
- O vocabulario core deixa de ser uma barra separada competindo: vira a PRIMEIRA LINHA FIXA da grade de pictogramas. Preserva a funcao da v4 (Phase 12 — palavras-nucleo sempre na mesma posicao) sem uma segunda barra poluindo a tela.

### Card de pictograma e cores de categoria
- As categorias do ARASAAC sao dinamicas; uma funcao de mapeamento associa cada categoria a uma das 5 familias de cor suave (acoes/comida/pessoas/lazer/rotina). Categorias sem correspondencia usam um tom neutro.
- A cor da categoria aparece no "tile" (bloco arredondado) ATRAS do pictograma — padrao do sketch 002 variante D. O rotulo continua texto abaixo, nunca etiqueta colorida.
- A densidade da grade (controle de 2-5 colunas existente) e MANTIDA; apenas o card e reestilizado.
- A estrela de favorito permanece como overlay circular no canto, no estilo dos sketches.

### Compositor e escopo
- O compositor adota o layout do sketch 003 variante A ("Ouvir heroi"): "Ouvir" e o botao dominante; "Gerar (IA)" fica rotulado, visivel, porem menor (acao de apoio). Limpar como link/controle discreto.
- Apagar figura: tocar na propria figura selecionada a remove (1 toque, sketch 001 variante F opcao 1); um controle discreto "limpar" aparece so quando ha figuras selecionadas.
- Escopo da fase 23: SOMENTE a tela principal — header, categorias, busca, grade, card, vocabulario core e compositor. A tela de configuracoes e a fase 24.

### Claude's Discretion
- Forma exata da funcao de mapeamento categoria->familia de cor e a lista de termos por familia.
- Ordem dos planos por regiao e onde cortar os limites entre eles.
- Detalhes de espacamento/raio dentro dos limites dados por `fundamentos-visuais.md`.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/theme.ts` — tokens "Salvia & Creme" + `themes`/`resolveTheme` + `theme.typography.*` (com `fontFamily` Nunito) + `theme.colors`, raios, sombras. Prontos para consumo (fase 22).
- `makeStyles(theme)` em `src/App.tsx` — factory de estilos via `useMemo`; os estilos da tela principal vivem aqui e serao reestilizados.
- `OptionChip`, `CategoryButton`, `SymbolCard`, `CachedImage` — componentes existentes em `src/App.tsx`.
- Alias `isHighContrast = isDarkTheme` — mantido; os ~162 refs JSX continuam validos.

### Established Patterns
- App single-screen monolitico (`src/App.tsx`); sem store global, sem navigation.
- Estilos via `makeStyles(theme)` + `useMemo` (estabelecido na fase 22).
- pt-BR para strings de UI; identificadores em ingles; TypeScript strict; lint = `tsc --noEmit`.
- `npm run test` Jest; 4 falhas pre-existentes herdadas (arasaacService) sao aceitas.

### Integration Points
- `src/App.tsx` — `makeStyles` (estilos), os returns JSX da tela principal (header, FlatList da grade, compositor), o componente `SymbolCard`.
- `src/theme.ts` — pode receber a funcao de mapeamento categoria->cor, ou ela fica em `src/constants.ts`.

</code_context>

<specifics>
## Specific Ideas

- Valores e padroes exatos: `sketch-findings-fala/references/tela-principal.md` (layout enxuto, card, compositor, anti-padroes) e `fundamentos-visuais.md`.
- Anti-padroes a evitar (do skill): badge vermelho em cada figura; caixa de lixeira dedicada; barra de vocabulario separada; rotulo como etiqueta colorida; Gerar e Ouvir do mesmo tamanho.
- Restricao dura: simplicidade acima de features; moldura quieta, pictograma heroi.

</specifics>

<deferred>
## Deferred Ideas

- Tela de configuracoes em drill-down — fase 24.
- Verificacao humana em device da fase 22 — fase 25.
- Ajuste fino dos pictogramas reais do ARASAAC na paleta — Future Requirements.

</deferred>
