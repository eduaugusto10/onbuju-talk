# MILESTONE ARCHIVE - v3

## Milestone
- Nome: Milestone 3 - Experiencia de Abertura (Tela Inicial)
- Status: shipped

## Scope
- Implementar tela inicial de abertura com orientacao rapida para o usuario.
- Persistir preferencia de pular abertura em acessos futuros.
- Validar regressao e polimento visual do fluxo de entrada.
- Expandir personalizacao visual com densidade de imagens por linha no grid principal.

## Phases
### Phase 8 - Contrato UX da Tela Inicial
- Objetivo: definir o comportamento da tela de abertura e seus estados de entrada.
- Entregas:
  - Estrutura visual da tela inicial (marca, mensagem curta e CTA principal).
  - Definicao da regra "mostrar sempre" vs "nao mostrar novamente".
  - Contrato de transicao para a tela principal.
- Verificacao:
  - Fluxo de entrada claro e sem ambiguidade.
  - Regras de exibicao persistente definidas.

### Phase 9 - Implementacao da Tela Inicial e Persistencia
- Objetivo: implementar a tela inicial com persistencia da preferencia de exibicao.
- Entregas:
  - Renderizacao da tela inicial na abertura do app.
  - Acao de continuar para a home principal.
  - Persistencia local da opcao de pular abertura nas proximas sessoes.
- Depends on: Phase 8
- Verificacao:
  - Tela inicial abre corretamente no primeiro acesso.
  - Preferencia de pular e respeitada nas aberturas seguintes.

### Phase 10 - Regressao e Polimento Final de Entrada
- Objetivo: validar ausencia de regressao e estabilidade do novo fluxo de abertura.
- Entregas:
  - Regressao dos fluxos principais apos a introducao da tela inicial.
  - Ajustes de UX visual iOS/Android na entrada.
  - Atualizacao de testes e checklist de release.
- Depends on: Phase 9
- Verificacao:
  - `npm run lint` e `npm run test` sem erros.
  - Fluxo de abertura sem atrito e fluxo principal preservado.

### Phase 11 - Configuracao de Densidade do Grid de Imagens
- Objetivo: permitir que o usuario ajuste quantas imagens aparecem por linha e manter legibilidade com cards responsivos.
- Entregas:
  - Opcao em configuracoes para selecionar quantidade de imagens por linha.
  - Grid principal adaptativo com redimensionamento proporcional dos cards.
  - Persistencia local da preferencia e limites de minimo/maximo para evitar quebra visual.
  - Ajustes de acessibilidade (toque, texto e espacamento) para densidades maiores.
- Depends on: Phase 10
- Verificacao:
  - Alteracao em configuracoes reflete imediatamente no grid principal.
  - Cards diminuem sem sobreposicao, corte de conteudo ou perda de usabilidade.
  - Preferencia permanece apos reiniciar o app.

## Key Accomplishments
- Fluxo de entrada foi formalizado por contrato UX e implementado com estados claros (`boot_loading`, `intro_visible`, `home_visible`).
- Tela inicial passou a suportar opcao "Nao mostrar novamente" com persistencia local (`intro_skip_enabled`).
- Regressao funcional e polimento visual do onboarding foram concluidos sem quebrar os fluxos principais do app.
- Cobertura de testes para entrada e configuracoes foi ampliada, mantendo `lint` e `test` sem erros.
- Usuario ganhou controle de densidade do grid de simbolos (`2` a `5` colunas) com aplicacao imediata e persistente.
