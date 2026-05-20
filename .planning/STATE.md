# STATE

## Current Position
- Milestone: v6 - Redesign Visual Calmo
- Phase: Phase 24 - Configuracoes Agrupadas com Drill-down (2/4 planos)
- Status: Phase 23 concluida (4/4 planos). Phase 24 em andamento: 24-01 (shell agrupado + drill-down) + 24-02 (grupo App restilizado) concluidos. Proximo: 24-03 (grupo Conteudo da crianca) e 24-04 (grupo Cuidador).
- Last activity: 2026-05-20 - Plano 24-02 concluido. Sub-telas Voz / Acessibilidade / Aparencia restilizadas com novos tokens drill* (drillSectionTitle/Card, drillFieldLabel/Hint, drillChipRow, drillToggleRow, drillPrimary/Secondary/DangerButton). Handlers verbatim preservados; isHighContrast removido das 3 sub-telas (Sereno Escuro cobre via tokens).

## Status
- Milestones arquivadas: v1 (Estabilizacao Mobile), v3 (Experiencia de Abertura), v5 (Refatoracao iOS).
- Milestone v4 (Comunicacao Pessoal e Rotina Visual) concluida em 2026-04-21 com 12/12 requisitos; aguardando arquivamento formal.
- Milestone v6: 4 fases (22-25), 11 requisitos (VIS, TELA, CFG, REG), 100% mapeados.
- Phase 22 concluida em codigo: planos 22-01 (tokens + fonte), 22-02 (integracao em App.tsx) e 22-03 (seletor de temas na config) concluidos. Verificacao humana em device da fase 22 adiada pelo usuario — fazer na fase 25 ou quando conveniente.
- VIS-02 FECHADO na fase 23: os 15 estilos de texto da tela principal adotam `theme.typography.*` (que carrega `fontFamily` Nunito); `grep "fontFamily: '" src/App.tsx` retorna 0. Demais telas (config/cenas/rotina) recebem o mesmo padrao nas fases 24/25.
- Codebase map em `.planning/codebase/`.
- `npm run lint` limpo; `npm run test` 22/26 (4 pre-existentes herdados aceitos).
- Validacao manual em device listada em `.planning/RELEASE-CHECKLIST.md`.

## Accumulated Context
- App Expo SDK 54 com vocabulario core, frases prontas + historico, simbolos pessoais, voz gravada, rotina visual, categorias customizadas (v1-v4) + refatoracao completa para estetica iOS (v5).
- Design system iOS em `src/theme.ts`; primitivos em `src/ui/`; haptics em `src/services/hapticsService.ts`.
- `expo-haptics` e `expo-blur` integrados com plugins em `app.json`.
- Milestone v6 e visual/UX: substitui a estetica iOS azul por "Salvia & Creme"; nenhuma feature funcional nova; toda a funcionalidade v1-v4 preservada.
- Fonte de design: skill `sketch-findings-fala` (`.claude/skills/sketch-findings-fala/`) — tema vencedor em `sources/themes/default.css`, referencias em `references/`; sketches em `.planning/sketches/`.
- Dependencias entre fases: Phase 22 (tema) e fundacao; Phases 23 e 24 dependem dela; Phase 25 depende de 23 e 24.
- Restricao dura preservada: simplicidade acima de riqueza de features (publico autista).

## Proximo Comando Recomendado
- Executar plano 24-03 (grupo Conteudo da crianca: Vocabulario / Frases / Simbolos / Categorias / Rotina / Cenas) — eliminar as listas densas "rotulo + 3 botoes" usando os tokens drill* da Phase 24-02. Em seguida 24-04 (grupo Cuidador: Senha 3 estados + Chave IA + Sair).

## Decisoes Recentes
- 24-02: OptionChip nas sub-telas do grupo App sem prop `highContrast` — tema Sereno Escuro cobre o caso noturno via tokens internos, eliminando o branch binario legado e mantendo a paleta Salvia & Creme coerente em todos os temas.
- 24-02: Cada secao do drill-down vira seu proprio `drillSectionCard` titulado em UPPERCASE muted (`drillSectionTitle`) — substitui o `configSectionCard` externo que adicionava padding/borda redundantes ao redor de varios controles agrupados.
- 24-02: Switch tematizado via `theme.colors.border` (track off) em vez de `#D1D1D6` hardcoded — Sereno Escuro recebe `#423F36` automaticamente.
- 23-03: Tile do pictograma com raio fixo (18/14/12 por densidade), mais arredondado que o card (theme.radii.md=16) — efeito 'tapete' do sketch 002 variante D.
- 23-03: Estilos coreVocabBar* e variantes high-contrast removidos — barra de vocabulario separada eliminada (anti-padrao do skill); core agora e ListHeaderComponent da grade.
- 23-02: categoryButtonTextActive / searchButtonText mantem texto branco literal (#FFFFFF) sobre salvia — salvia e escura o suficiente para contraste; tokens de tema nao tem 'onPrimary' dedicado.
- 23-02: inputHighContrast preservado verbatim (array legado ainda no JSX) — fora do escopo do plano, coberto pelo tema sereno-escuro.
- 23-01: Match categoria->familia de cor por token de palavra inteira em vez de substring crua — evita falso positivo ('acao' casava dentro de 'alimentacao').
- 23-01: Slogan removido apenas do header (headerTagline); introSubtitle da tela de intro preservada (fora de escopo da fase 23).
- 22-03: Seletor de 3 temas reusa o OptionChip existente na secao 'acessibilidade' da config — sem redesenhar a tela (drill-down e fase 24).
- 22-03: Verificacao humana em device/emulador da fase 22 adiada por escolha do usuario — VIS-03 nao marcado como totalmente concluido.
- 22-02: Componentes auxiliares fora de App leem um espelho de modulo (moduleStyles/moduleTheme) atualizado por App no inicio do render — evita refatorar 13 componentes e seus call sites mantendo reatividade ao tema.
- 22-02: Tokens legacy em estilos nao-shell foram inlinados como valores literais (nao tokenizados) para garantir zero regressao visual; restyling tela a tela fica para as fases 23/24.

## Ultima Atualizacao
- 2026-05-20: Plano 24-02 concluido. Sub-telas Voz / Acessibilidade / Aparencia do grupo App restilizadas com 9 novos tokens drill* (drillSectionTitle / drillSectionCard / drillFieldLabel / drillFieldHint / drillChipRow / drillToggleRow / drillPrimary/Secondary/DangerButton). Voz: cards VELOCIDADE + TOM + botao Testar voz salvia. Acessibilidade: card TEMA DO APLICATIVO (3 chips) + card FEEDBACK (Switch tematizado). Aparencia: card ESCALA + card IMAGENS POR LINHA. Handlers preservados verbatim; isHighContrast removido. Lint limpo; test 22/26 (sem novas falhas). CFG-01 e CFG-02 avancando. Phase 24: 2/4 planos.
- 2026-05-19: Plano 23-03 concluido. SymbolCard refeito (sketch 002 variante D): cor da categoria em tile arredondado atras do pictograma via categoryColorFamily, card em surface com borda/sombra de tema, estrela de favorito como overlay circular. Vocabulario core deixou de ser barra separada e virou a primeira linha fixa da grade (ListHeaderComponent); estilos coreVocabBar* orfaos removidos. emptyText/symbolLabel migrados para theme.typography (Nunito) — VIS-02 avancando. Lint limpo; test 22/26 (4 pre-existentes, sem novas falhas). TELA-01 e TELA-02 concluidos. Phase 23: 3/4 planos.
- 2026-05-19: Plano 23-02 concluido. Barra de categorias com pills salvia (ativo) / bgSoft neutro (inativo) e raio full; campo de busca com fundo surface2, raio sm e fonte Nunito (typography.callout); searchButton em salvia; listCard sobre bgSoft com raio lg; ActivityIndicator tokenizado. Azul iOS (#007AFF) e cinza iOS (#F2F2F7) removidos dessas regioes. VIS-02 avancando (grep theme.typography subiu para 5). Lint limpo; test 22/26 (4 pre-existentes, sem novas falhas). Phase 23: 2/4 planos.
- 2026-05-19: Plano 23-01 concluido. Header da tela principal sem o slogan 'Comunicação assistiva' (headerTagline removido; introSubtitle da intro intacta); estilos do header migrados para tokens theme.colors/theme.typography (fonte Nunito aplicada em title e adminBadgeText — VIS-02 parcialmente fechado). Novo modulo src/categoryColors.ts com categoryColorFamily (categoria ARASAAC -> 5 familias de cor + neutro), pronto para o card da fase 23-03. Lint limpo; test 22/26 (4 pre-existentes, sem novas falhas). Phase 23: 1/4 planos.
