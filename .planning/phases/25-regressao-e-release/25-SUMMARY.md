---
plan: 25-01
phase: 25
status: complete
---

# Plano 25-01 — Regressão e Release

## Resultado da auditoria automática
- `npm run lint` (`tsc --noEmit`): limpo ✓
- `npm run test`: 22/26 (4 pré-existentes em `arasaacService` — baseline aceito, sem novas falhas) ✓
- `grep "fontFamily: '" src/App.tsx`: **0** ✓ (VIS-02 fechado)
- `grep "contrastMode" src/App.tsx`: **0** ✓ (substituído por `themeName`)
- `grep "ConfigSection" src/App.tsx`: **0** ✓ (substituído por `ConfigRoute` drill-down)
- `grep "#007AFF" src/App.tsx`: **5** (todas em editores Rotina/Cenas internals — Deferred per CONTEXT)

## Limpeza feita
- Removidos 6 estilos órfãos do `configNav*` (não usados desde a Phase 24-01): `configNav`, `configNavItem`, `configNavItemActive` (era 1 das 6 ocorrências `#007AFF`), `configNavIcon`, `configNavItemText`, `configNavItemTextActive`.

## Pendências carregadas (documentadas no RELEASE-CHECKLIST.md)
- **Verificação humana em device da Phase 22** (adiada pelo usuário): testar 3 temas + Nunito + persistência.
- **Validação geral em device** da Milestone v6 inteira: 7 pontos visuais + smoke test funcional v1-v4.
- **Future Requirements**: redesign de Cenas (VSD) e Rotina (visão da criança); ajuste fino dos pictogramas reais do ARASAAC.

## RELEASE-CHECKLIST.md
Atualizado com a seção **Milestone 6 - Redesign Visual Calmo**, **Regressao Final Milestone 6**, e **Pendencias carregadas**.

## Conclui (Phase 25)
- REG-01 (regressão e release) — concluído.
- Milestone v6 — Redesign Visual Calmo — código completo (4/4 fases); aguarda apenas validação humana em device para release.
