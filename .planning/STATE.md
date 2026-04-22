# STATE

## Current Position
- Phase: 17 - Design System iOS (Tokens e Primitivos) - COMPLETA
- Plan: 17-design-system-ios/PLAN.md (1/1 plans complete)
- Status: Phase 17 concluida; pronta para Phase 18
- Last activity: 2026-04-21 - Phase 17 concluida (tokens + primitivos + deps nativas instaladas)

## Status
- Projeto inicializado no fluxo GSD.
- Codebase map ja criado em `.planning/codebase/`.
- Milestone 1 - Estabilizacao Mobile arquivada (v1).
- Milestone 3 - Experiencia de Abertura (Tela Inicial) arquivada (v3).
- Milestone v4 - Comunicacao Pessoal e Rotina Visual concluida 2026-04-21 (12/12 requisitos; aguardando arquivamento).
- Milestone ativa: v5 - Refatoracao de Design no Estilo iOS.
- REQUIREMENTS.md da v5 definida (16 requisitos, 6 categorias: DS, MAIN, SHEET, CFG, FDB, REG).
- ROADMAP.md da v5 definido com 5 fases (Phase 17-21), 100% de cobertura.
- Phase 17 COMPLETA: tokens centralizados (`src/theme.ts`), 6 primitivos iOS (`src/ui/`), `expo-haptics`/`expo-blur` instalados + plugins, header refatorado como POC. `npm run lint` limpo, test suite sem novos failures (22/26 passing; 4 falhas herdadas pre-existentes no arasaacService).
- Proxima fase: Phase 18 (Tela Principal estilo iOS).

## Accumulated Context
- App Expo SDK 54 com vocabulario core, frases prontas + historico, simbolos pessoais (camera/galeria), voz gravada do cuidador, rotina visual e categorias customizadas (milestones v1-v4).
- Tela inicial (splash/intro) entregue na v3.
- v5 foco: refatoracao visual para iOS (iPhone design language); sem mudanca de funcionalidade.
- Numeracao de fases continua a partir da Phase 17 (v4 terminou em Phase 16).
- Restricao dura: simplicidade acima de riqueza de features (publico autista).
- Deps nativas Phase 17: expo-haptics ^15.0.7, expo-blur ^15.0.7 — instaladas e plugins registrados em `app.json`.
- Tokens disponiveis: `colors`, `typography`, `radii`, `spacing`, `shadows` em `src/theme.ts`.
- Primitivos disponiveis em `src/ui/`: IOSButton, IOSCard, IOSSectionHeader, IOSListSection, IOSListRow, IOSBottomSheet.
- Sequenciamento das fases da v5:
  - Phase 17 (design system + tokens + primitivos) COMPLETA.
  - Phase 18 (tela principal) consome os tokens.
  - Phase 19 (sheets) consome tokens e primitivo `IOSBottomSheet` da Phase 17; aplica BlurView no backdrop.
  - Phase 20 (config Ajustes + haptics) consome todos os anteriores; pode rodar apos Phase 19.
  - Phase 21 (regressao e release) fecha a milestone.

## Proximo Comando Recomendado
- `/gsd-discuss-phase 18` (gather context) ou `/gsd-plan-phase 18` (planejar direto)

## Ultima Atualizacao
- 2026-04-21: Phase 17 concluida. Design system iOS estabelecido. Pronto para Phase 18 (Tela Principal estilo iOS).
