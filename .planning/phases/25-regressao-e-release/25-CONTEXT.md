# Phase 25: Regressao e Release - Context

**Gathered:** 2026-05-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Fase final da milestone v6. Valida que todos os fluxos v1-v4 continuam funcionando
sem regressao apos o redesign visual (fases 22-24), garante `npm run lint` e
`npm run test` limpos, atualiza o `RELEASE-CHECKLIST.md` com a secao v6, e
documenta as pendencias carregadas (verificacao humana adiada da fase 22).

Nao introduz novas features, nao reestiliza nada novo, nao mexe em decisoes
fechadas das fases 22/23/24.

</domain>

<decisions>
## Implementation Decisions

### Estrategia
- Plano unico (25-01) com: (a) auditoria automatica (lint + test + greps de anti-padroes); (b) auditoria visual de anti-padroes residuais (azul iOS literal, fonte de sistema hardcoded, listas densas restantes, badges vermelhos); (c) atualizacao do `RELEASE-CHECKLIST.md` com a secao v6 e os 6 pontos de validacao em device; (d) registro das pendencias carregadas.
- Pendencias carregadas: verificacao humana em device da fase 22 (3 temas, fonte Nunito, persistencia) — documentada no checklist como item de release pendente do usuario.
- Future Requirements (redesign Cenas/Rotina criança, pictogramas reais ARASAAC) ficam Deferred — nao entram nesta milestone.

### Escopo
- Phase 25 NAO altera o codigo de telas redesenhadas (22/23/24). Apenas: (1) leitura/auditoria; (2) ediçao do checklist; (3) ediçao do SUMMARY/STATE/REQUIREMENTS para marcar REG-01 concluido.
- Se a auditoria automatica encontrar regressao real, abrir como gap closure ou nova fase.

### Claude's Discretion
- Forma exata da auditoria visual (lista de greps de anti-padroes).
- Estrutura da nova secao v6 no RELEASE-CHECKLIST.md.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `npm run lint` (= `tsc --noEmit`) e `npm run test` (Jest, 22/26 baseline com 4 pre-existentes herdados em arasaacService).
- `.planning/RELEASE-CHECKLIST.md` existe — recebera secao v6.
- `.planning/REQUIREMENTS.md` — REG-01 sera marcado completo.

### Established Patterns
- Pre-existentes herdados em testes (4 arasaacService failures) sao baseline aceito; sem novas falhas.
- Anti-padroes proibidos: azul iOS `#007AFF`, fonte de sistema hardcoded, badges vermelhos em chips, caixas de lixeira dedicadas, abas de config bloqueadas mostradas a deslogado, listas densas com 3 botoes apertados.

### Integration Points
- Apenas arquivos de documentacao do `.planning/` mudam (RELEASE-CHECKLIST.md, REQUIREMENTS.md, STATE.md, ROADMAP.md, 25-SUMMARY).

</code_context>

<specifics>
## Specific Ideas

- Anti-padroes definitivos: `.claude/skills/sketch-findings-fala/references/*.md`.
- Lista de fluxos v1-v4 a regredir: composer (buscar, selecionar, gerar, ouvir, salvar), favoritos, vocabulario core, frases prontas, historico, simbolos pessoais (camera/galeria), voz gravada, rotina visual, categorias customizadas, admin.

</specifics>

<deferred>
## Deferred Ideas

- Redesenho de layout das telas Cenas (VSD) e Rotina (visao da crianca) — Future Requirements.
- Ajuste fino dos pictogramas reais do ARASAAC na paleta nova — Future Requirements.
- Verificacao humana em device da fase 22 — documentada como pendencia de release no checklist.

</deferred>
