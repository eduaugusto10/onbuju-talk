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
