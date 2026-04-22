# Phase 21: Regressao, Polimento e Release - Context

**Gathered:** 2026-04-21
**Status:** Ready for planning
**Mode:** Auto-generated

<domain>
## Phase Boundary

Fechar milestone v5: regressao final de todos os fluxos v1-v4 + v5, correcoes de bugs visuais detectados, consistencia em alto contraste, checklist de release atualizado. `npm run lint` e `npm run test` sem novas falhas.

</domain>

<decisions>
## Implementation Decisions

### Regressao
- **D-01:** Regressao automatizada via `npm run lint` + `npm run test -- --runInBand` (22 passing + 4 pre-existing failures inherited no arasaacService — aceitos per REQUIREMENTS.md v5 §Criterio 2).
- **D-02:** Regressao manual em device real (ou Expo Go) — documentada em RELEASE-CHECKLIST.md com marcacao de checkboxes por fluxo.

### Polimento
- **D-03:** Scan visual para detectar inconsistencias apos Phases 17-20:
  - Cores hardcoded remanescentes (hex strings tipo `#xxxxxx` em styles que deveriam usar `colors.*`).
  - Raios ou padding fora da escala iOS.
  - Alto contraste verificado em cada bloco refatorado.
- **D-04:** Correcoes pontuais se detectadas (cap em ~5 edits para manter escopo controlado).

### Release prep
- **D-05:** Atualizar `.planning/RELEASE-CHECKLIST.md` com secao "Milestone 5 - Refatoracao iOS" + regressao completa.
- **D-06:** Validar `.env.example` atualizado (unchecked no checklist atual).
- **D-07:** STATE.md + ROADMAP.md marcados como milestone v5 completa.

### Cleanup opcional (condicional)
- **D-08:** Se tempo permitir, remover estilos claramente obsoletos (`modalBackdrop`, `modalCard`, `modalButtonLight`, `modalButtonPrimary`, `modalCardHighContrast` referenciados apenas em codigo removido). Se houver qualquer referencia remanescente, deferir para milestone futura.

### Claude's Discretion
- Quais testes automatizados incluir no criterio final (passa basta nao piorar — 22 passing, 4 pre-existing failures herdadas).
- Se descobrir bugs visuais significativos durante scan, priorizar fix se for trivial (< 10 linhas); caso contrario documentar e deferir.

</decisions>

<canonical_refs>
## Canonical References

- `.planning/ROADMAP.md` §"Phase 21 - Regressao, Polimento e Release" — deliverables.
- `.planning/REQUIREMENTS.md` §"Regressao (REG)" — REG-01.
- `.planning/RELEASE-CHECKLIST.md` — checklist atual a atualizar.
- Phases 17-20 SUMMARY.md — para entender o que foi refatorado.
- `.env.example` — validar atualizado.

</canonical_refs>

<code_context>
## Existing Code Insights

- Lint limpo ao final de Phase 20.
- Test suite: 22 passing / 4 pre-existing failures (arasaacService network mocks).
- Estilos legacy remanescentes: `modalBackdrop`, `modalCard`, `modalTitle`, `modalActions`, `modalButtonLight`, `modalButtonPrimary`, `modalButtonPrimaryText`, `modalCardHighContrast`, `configHeader`, `configCloseButton`, `configCloseIcon`, `symbolDraftCard`, `symbolDraftPreview` (parcial), `inputHighContrast` (parcial).
- Header card ja nao usa `E8E1D2` border (Phase 18 removeu); outros blocos podem ainda ter.

</code_context>

<specifics>
## Specific Ideas

- Nao introduzir novas features.
- Se `npm run test` ainda der 4 failures do arasaac, registrar como pre-existente (ja documentado).
- RELEASE-CHECKLIST manual items ficam como "pendente validacao em device" (sem marca check) — cabe ao operador humano concluir.

</specifics>

<deferred>
## Deferred Ideas

- Remocao completa dos estilos legacy — pode ficar para milestone de cleanup futura se risco de quebra.
- Fix dos 4 testes pre-existentes do arasaacService — fora do escopo v5.
- Dark mode / semantic colors.

</deferred>

---

*Phase: 21-regressao-release*
*Context gathered: 2026-04-21*
