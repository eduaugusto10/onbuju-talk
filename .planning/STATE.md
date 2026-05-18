# STATE

## Current Position
- Milestone: v6 - Redesign Visual Calmo
- Phase: nao iniciada (definindo requisitos)
- Status: Definindo requisitos
- Last activity: 2026-05-18 - Milestone v6 iniciada (redesign visual a partir dos sketches).

## Status
- Milestones arquivadas: v1 (Estabilizacao Mobile), v3 (Experiencia de Abertura), v5 (Refatoracao iOS).
- Milestone v4 (Comunicacao Pessoal e Rotina Visual) concluida em 2026-04-21 com 12/12 requisitos; aguardando arquivamento formal.
- Codebase map em `.planning/codebase/`.
- `npm run lint` limpo; `npm run test` 22/26 (4 pre-existentes herdados aceitos).
- Validacao manual em device listada em `.planning/RELEASE-CHECKLIST.md`.

## Accumulated Context
- App Expo SDK 54 com vocabulario core, frases prontas + historico, simbolos pessoais, voz gravada, rotina visual, categorias customizadas (v1-v4) + refatoracao completa para estetica iOS (v5).
- Design system iOS em `src/theme.ts`; primitivos em `src/ui/`; haptics em `src/services/hapticsService.ts`.
- `expo-haptics` e `expo-blur` integrados com plugins em `app.json`.
- Restricao dura preservada: simplicidade acima de riqueza de features (publico autista).

## Proximo Comando Recomendado
- Validacao manual em device do checklist em `.planning/RELEASE-CHECKLIST.md` antes do release.
- Para iniciar proxima milestone: `/gsd-new-milestone`.

## Ultima Atualizacao
- 2026-04-21: Milestone v5 arquivada (`.planning/milestones/v5-ROADMAP.md`, `.planning/milestones/v5-REQUIREMENTS.md`, `.planning/phases/archive-v5/`). ROADMAP.md e STATE.md atualizados.
