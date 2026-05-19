# STATE

## Current Position
- Milestone: v6 - Redesign Visual Calmo
- Phase: Phase 22 - Sistema de Tema "Salvia & Creme" (em andamento — 2/3 planos)
- Status: Plano 22-02 concluido — tema integrado em App.tsx; proximo: plano 22-03 (seletor de temas)
- Last activity: 2026-05-19 - Plano 22-02 executado: estado themeName, makeStyles factory, fonte Nunito no boot e shell tematizado em src/App.tsx.

## Status
- Milestones arquivadas: v1 (Estabilizacao Mobile), v3 (Experiencia de Abertura), v5 (Refatoracao iOS).
- Milestone v4 (Comunicacao Pessoal e Rotina Visual) concluida em 2026-04-21 com 12/12 requisitos; aguardando arquivamento formal.
- Milestone v6: 4 fases (22-25), 11 requisitos (VIS, TELA, CFG, REG), 100% mapeados.
- Phase 22 em andamento: planos 22-01 (tokens + fonte) e 22-02 (integracao em App.tsx) concluidos; plano 22-03 (seletor de temas na config) pendente.
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
- Executar o plano 22-03 (seletor de 3 temas na tela de configuracoes + verificacao humana).

## Decisoes Recentes
- 22-02: Componentes auxiliares fora de App leem um espelho de modulo (moduleStyles/moduleTheme) atualizado por App no inicio do render — evita refatorar 13 componentes e seus call sites mantendo reatividade ao tema.
- 22-02: Toggle "Alto contraste" da config legada re-cabeado para alternar themeName default<->sereno-escuro como ponte ate o plano 22-03 trazer o seletor de 3 opcoes.
- 22-02: Tokens legacy em estilos nao-shell foram inlinados como valores literais (nao tokenizados) para garantir zero regressao visual; restyling tela a tela fica para as fases 23/24.

## Ultima Atualizacao
- 2026-05-19: Plano 22-02 concluido. src/App.tsx integra o sistema de tema: estado themeName substitui contrastMode, factory makeStyles(theme) via useMemo, fonte Nunito carregada no boot, migracao da chave legada contrast_mode e shell (SafeAreaView + StatusBar + fundos) tematizado. Lint limpo; test 22/26 (4 pre-existentes, sem novas falhas). Phase 22: 2/3 planos.
