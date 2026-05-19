# STATE

## Current Position
- Milestone: v6 - Redesign Visual Calmo
- Phase: Phase 22 - Sistema de Tema "Salvia & Creme" (em andamento — 1/3 planos)
- Status: Plano 22-01 concluido — fundacao de tokens pronta; proximo: plano 22-02
- Last activity: 2026-05-19 - Plano 22-01 executado: API de tema Salvia & Creme + fonte Nunito em src/theme.ts.

## Status
- Milestones arquivadas: v1 (Estabilizacao Mobile), v3 (Experiencia de Abertura), v5 (Refatoracao iOS).
- Milestone v4 (Comunicacao Pessoal e Rotina Visual) concluida em 2026-04-21 com 12/12 requisitos; aguardando arquivamento formal.
- Milestone v6: 4 fases (22-25), 11 requisitos (VIS, TELA, CFG, REG), 100% mapeados.
- Phase 22 em andamento: plano 22-01 concluido (tokens + fonte Nunito); planos 22-02 e 22-03 pendentes.
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
- Executar o plano 22-02 (integrar tema em App.tsx: estado themeName, makeStyles factory, fonte no boot, shell).

## Ultima Atualizacao
- 2026-05-19: Plano 22-01 concluido. src/theme.ts agora expoe a API de tema "Salvia & Creme" (3 temas, resolveTheme, NUNITO_FONT_MAP) lado a lado com os exports legacy iOS intactos; expo-font e @expo-google-fonts/nunito instalados. Lint limpo; test 22/26 (4 pre-existentes). Phase 22: 1/3 planos.
