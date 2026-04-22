# PLAN - Phase 21 - Regressao, Polimento e Release

## Objetivo
Fechar milestone v5: executar regressao automatizada final (lint + test), atualizar RELEASE-CHECKLIST com items v5, marcar milestone como completa. Polimento opcional de inconsistencias remanescentes.

## Requisitos Mapeados
- REG-01: regressao sem quebrar fluxos v1-v4.

## Escopo

### 1. Regressao automatizada
- `npm run lint` -> esperar pass.
- `npm run test -- --runInBand` -> esperar 22 passing + 4 failures pre-existentes.

### 2. Polimento (condicional)
- Scan por hex colors ainda presentes em estilos principais (`#XXXXXX`) que deveriam ter migrado.
- Se encontrar correcoes triviais (< 5 pontos), aplicar; caso contrario, documentar no SUMMARY como known minor issues.
- Nao corrigir: estilos legacy que ainda tem referencias (ex.: se modalBackdrop/modalCard ainda e referenciado por algo; grep confirma antes de remover).

### 3. Verificar `.env.example`
- Confirmar que esta presente e atualizado (ja existe no repo).

### 4. Atualizar RELEASE-CHECKLIST.md
- Adicionar secao "## Milestone 5 - Refatoracao iOS" com items:
  - [x] Design system iOS (tokens + 6 primitivos) (Phase 17)
  - [x] expo-haptics + expo-blur instalados e plugins (Phase 17)
  - [x] Tela principal em estetica iOS (header, categorias, search, grid, composer) (Phase 18)
  - [x] Bottom sheets iOS com BlurView backdrop e grabber (Phase 19)
  - [x] Config Ajustes visual iOS + Switch nativo + Haptic feedback (Phase 20)
- Adicionar secao "## Regressao Final Milestone 5" com items listando fluxos (pendente validacao em device — unchecked).
- Marcar "npm run lint" e "npm run test" checkboxes OK.

### 5. Atualizar STATE.md
- Phase 21 -> Complete.
- Milestone v5 -> Complete (aguardando arquivamento).

### 6. Atualizar ROADMAP.md
- Phase 21 checkbox marcada e progress table 1/1 Complete.

### 7. SUMMARY.md da Phase 21.

## Fora de Escopo
- Fix dos 4 testes pre-existentes (arasaacService).
- Remocao de estilos legacy com referencias ativas.
- Dark mode.
- Novos features.

## Arquivos Alvo
- `.planning/RELEASE-CHECKLIST.md`
- `.planning/STATE.md`
- `.planning/ROADMAP.md`
- `.planning/phases/21-regressao-release/SUMMARY.md` (novo)

## Plano de Implementacao

1. Rodar `npm run lint` — validar pass.
2. Rodar `npm run test -- --runInBand` — validar 22/26 (sem regressao).
3. Grep por `#[0-9a-fA-F]{6}` em src/App.tsx (style blocks) para scan rapido; triage se encontrar.
4. Atualizar RELEASE-CHECKLIST.md com secao v5.
5. Atualizar STATE.md marcando milestone completa.
6. Atualizar ROADMAP.md (Phase 21 + Progress Table).
7. Escrever SUMMARY.md.
8. Commit final "feat(phase-21): close milestone v5".

## Criterios de Aceite (UAT)
1. `npm run lint` limpo.
2. `npm run test -- --runInBand` sem novas falhas (22 passing / 4 inherited).
3. RELEASE-CHECKLIST.md tem secao v5 com deliverables marcados.
4. STATE.md mostra milestone v5 completa.
5. ROADMAP.md Phase 21 checkbox e progress 1/1 Complete.

## Verificacao
- Automatizada: lint + test.
- Manual: revisao dos checklists e STATE.

## Riscos
- Scan de hex colors pode revelar muitos pontos ainda nao migrados — se excessivos, documentar como known minor em vez de corrigir (fora do escopo desta phase).

## Mitigacoes
- Cap em 5 correcoes; o resto vira cleanup futuro.

## Dependencias
- Depends on: Phases 17, 18, 19, 20.
- Desbloqueia: arquivamento da milestone v5.
