# STATE

## Current Position
- Milestone: v6 - Redesign Visual Calmo
- Phase: Phase 22 - Sistema de Tema "Salvia & Creme" (concluida em codigo — 3/3 planos)
- Status: Phase 22 concluida (3/3 planos). Proximo: Phase 23 (Tela Principal Redesenhada).
- Last activity: 2026-05-19 - Plano 22-03 executado: seletor de 3 temas na config (verificacao humana adiada pelo usuario).

## Status
- Milestones arquivadas: v1 (Estabilizacao Mobile), v3 (Experiencia de Abertura), v5 (Refatoracao iOS).
- Milestone v4 (Comunicacao Pessoal e Rotina Visual) concluida em 2026-04-21 com 12/12 requisitos; aguardando arquivamento formal.
- Milestone v6: 4 fases (22-25), 11 requisitos (VIS, TELA, CFG, REG), 100% mapeados.
- Phase 22 concluida em codigo: planos 22-01 (tokens + fonte), 22-02 (integracao em App.tsx) e 22-03 (seletor de temas na config) concluidos. Verificacao humana em device da fase 22 adiada pelo usuario — fazer na fase 25 ou quando conveniente.
- GAP CARREGADO (VIS-02): fonte Nunito carregada (`NUNITO_FONT_MAP` via `useFonts`) e tokens `theme.typography.*` carregam `fontFamily`, mas nenhum `<Text>` em `src/App.tsx` aplica `fontFamily` — `grep fontFamily src/App.tsx` retorna 0. VIS-02 NAO esta de fato satisfeito; fechar aplicando os tokens tipograficos no restyling das fases 23/24, ou explicitamente na fase 25.
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
- Iniciar a Phase 23 (Tela Principal Redesenhada). Ao reestilizar os textos, adotar os tokens `theme.typography.*` para fechar o gap VIS-02 (fonte Nunito aplicada).

## Decisoes Recentes
- 22-03: Seletor de 3 temas reusa o OptionChip existente na secao 'acessibilidade' da config — sem redesenhar a tela (drill-down e fase 24).
- 22-03: Verificacao humana em device/emulador da fase 22 adiada por escolha do usuario — VIS-03 nao marcado como totalmente concluido.
- 22-02: Componentes auxiliares fora de App leem um espelho de modulo (moduleStyles/moduleTheme) atualizado por App no inicio do render — evita refatorar 13 componentes e seus call sites mantendo reatividade ao tema.
- 22-02: Tokens legacy em estilos nao-shell foram inlinados como valores literais (nao tokenizados) para garantir zero regressao visual; restyling tela a tela fica para as fases 23/24.

## Ultima Atualizacao
- 2026-05-19: Plano 22-03 concluido. src/App.tsx substitui o toggle de alto contraste pelo seletor de 3 temas (OptionChip) na secao de acessibilidade da config. Lint limpo; test 22/26 (4 pre-existentes, sem novas falhas). Phase 22: 3/3 planos em codigo. Pendencias carregadas: verificacao humana em device adiada; VIS-02 (fonte Nunito carregada mas nao aplicada a nenhum Text) a fechar nas fases 23/24/25.
