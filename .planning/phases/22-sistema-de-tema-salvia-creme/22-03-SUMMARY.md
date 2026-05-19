---
phase: 22-sistema-de-tema-salvia-creme
plan: 03
subsystem: ui
tags: [theme, theme-selector, config, accessibility, nunito, OptionChip]

# Dependency graph
requires:
  - phase: 22-02
    provides: "estado themeName / setThemeName, alias isHighContrast, persistencia automatica de tema, makeStyles(theme)"
provides:
  - "Seletor de 3 temas (Salvia & Creme / Terracota / Sereno Escuro) na secao de acessibilidade da config"
  - "Remocao do ultimo uso de UI do toggle legado de alto contraste (Switch contrastMode)"
affects:
  - "fase 23 — restyling de header/grade/composer; deve aplicar theme.typography.* (que carrega fontFamily Nunito)"
  - "fase 24 — tela de config drill-down absorve este seletor de tema no novo layout"
  - "fase 25 — regressao; deve fechar a verificacao humana adiada e o gap VIS-02 (fonte nao aplicada)"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Seletor de enum via linha de OptionChip (mesmo padrao de escala de UI / grid columns / voz)"

key-files:
  created:
    - ".planning/phases/22-sistema-de-tema-salvia-creme/22-03-SUMMARY.md"
  modified:
    - "src/App.tsx — seletor de 3 temas na secao de acessibilidade da config"

key-decisions:
  - "Seletor de tema reusa o OptionChip existente — mesmo padrao visual das demais opcoes da config; nao redesenha a tela (drill-down e fase 24)"
  - "Verificacao humana em device/emulador ADIADA pelo usuario — nao executada; a ser feita na regressao da fase 25 ou pelo usuario quando conveniente"

patterns-established:
  - "Selecao de tema: 3 OptionChip ligados a setThemeName na secao 'acessibilidade'"

requirements-completed: []  # VIS-03 NAO totalmente fechado — verificacao humana adiada (ver Deviations)

# Metrics
duration: ~8min
completed: 2026-05-19
---

# Phase 22 Plan 03: Seletor de Tema na Configuracao Summary

**Seletor de 3 temas ("Salvia & Creme", "Terracota", "Sereno Escuro") via OptionChip na secao de acessibilidade da config, substituindo o toggle binario de alto contraste — verificacao humana em device adiada pelo usuario.**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-05-19
- **Completed:** 2026-05-19
- **Tasks:** 1 de 2 executada (Task 2 adiada pelo usuario)
- **Files modified:** 1

## Accomplishments
- Toggle binario "Alto contraste" (ponte legada do plano 22-02) removido da secao de acessibilidade.
- Seletor "Tema do aplicativo" adicionado com 3 `OptionChip` (Salvia & Creme / Terracota / Sereno Escuro) ligados a `setThemeName`.
- Toggle "Feedback visual" mantido intacto; texto de dica atualizado para descrever os temas.
- `npm run lint` limpo; `npm run test` sem novas falhas alem das 4 pre-existentes herdadas.

## Task Commits

1. **Task 1: Substituir o toggle de alto contraste pelo seletor de 3 temas** - `39888f9` (feat)
2. **Task 2: Verificacao humana da troca de tema em device/emulador** - DEFERIDA pelo usuario; nenhum commit (checkpoint humano, nada a implementar).

**Plan metadata:** docs(22-03) — este SUMMARY + STATE/ROADMAP/REQUIREMENTS.

## Files Created/Modified
- `src/App.tsx` - Secao `configSection === 'acessibilidade'`: removido o `<View style={styles.iosToggleRow}>` do Switch "Alto contraste"; adicionado o bloco `settingLabel` + `settingActions` com 3 `OptionChip` de tema; dica atualizada.

## Decisions Made
- O seletor reusa o `OptionChip` existente, mantendo consistencia visual com as demais opcoes da config. A tela de configuracao NAO foi redesenhada — o drill-down agrupado e escopo da fase 24.
- Verificacao humana adiada por escolha explicita do usuario (ver Deviations).

## Deviations from Plan

### 1. Task 2 (checkpoint human-verify) ADIADA pelo usuario

- **O que:** O checkpoint `checkpoint:human-verify` da Task 2 pedia validacao visual em device/emulador (3 temas trocam ao vivo, persistem apos reiniciar, fonte Nunito visivel, sem azul iOS).
- **Decisao do usuario:** Adiar a verificacao em device e seguir com a milestone. A verificacao NAO foi executada e NAO foi auto-verificada.
- **A fazer:** Executar a verificacao humana durante a regressao da fase 25, ou pelo usuario quando conveniente (rodar `npm run start`, abrir no emulador/device, validar os passos descritos na Task 2 do `22-03-PLAN.md`).
- **Impacto:** O criterio de sucesso "VIS-03 satisfeito e validado em device/emulador" fica com a parte de codigo concluida (seletor implementado, runtime/persistencia prontos desde 22-02) mas a parte de validacao visual pendente. VIS-03 permanece NAO marcado como totalmente concluido em REQUIREMENTS.md.

### 2. GAP A CARREGAR — VIS-02: fonte Nunito carregada porem NAO aplicada (IMPORTANTE)

- **O que foi encontrado:** A fonte Nunito esta carregada (`NUNITO_FONT_MAP` via `useFonts` no boot de `src/App.tsx`, gateando o render) e `src/theme.ts` define tokens de tipografia (`theme.typography.*`) que referenciam a fonte via `fontFamily` (linhas 367-377 de `theme.ts`: `largeTitle`, `title1-3`, `headline`, `body`, `callout`, `subheadline`, `footnote`, `caption1-2`).
- **O problema:** NENHUM `<Text>` em `src/App.tsx` aplica `fontFamily`. `grep fontFamily src/App.tsx` retorna ZERO ocorrencias. Ou seja: a fonte Nunito esta carregada na memoria mas nao e usada por nenhum texto renderizado — o app continua exibindo a fonte de sistema.
- **Consequencia:** O requisito **VIS-02 ("App usa a fonte Nunito") NAO esta de fato satisfeito.** A fonte esta disponivel mas inerte. O criterio "Textos do app aparecem na fonte Nunito arredondada em vez da fonte de sistema" falha hoje.
- **Como fechar:** Este gap deve ser fechado quando as fases 23 e 24 reestilizarem as telas — os novos estilos de texto dessas fases DEVEM adotar os tokens `theme.typography.*`, que ja carregam o `fontFamily` Nunito. Alternativamente, fechar explicitamente na fase 25 (regressao) aplicando os tokens tipograficos aos `<Text>` existentes. Enquanto isso nao ocorrer, VIS-02 permanece parcialmente concluido (fonte carregada, nao aplicada) e assim esta registrado em REQUIREMENTS.md.
- **Razao pela qual nao foi corrigido aqui:** O plano 22-02 decidiu explicitamente nao tokenizar estilos nao-shell (zero regressao visual; restyling tela a tela fica para 23/24). Aplicar `fontFamily` globalmente agora seria escopo das fases 23/24 e fora do escopo deste plano (que e somente o seletor de tema na config).

---

**Total deviations:** 1 checkpoint adiado pelo usuario + 1 gap conhecido carregado para 23/24/25.
**Impact on plan:** A Task 1 foi executada exatamente como planejada. A Task 2 (verificacao humana) ficou pendente por decisao do usuario. VIS-02 e VIS-03 NAO sao marcados como totalmente concluidos.

## Issues Encountered
Nenhum problema durante a Task 1 — lint e testes passaram na primeira execucao.

## Known Stubs
Nenhum stub de codigo. Ver Deviation 2 (gap de fonte) — nao e um stub, e funcionalidade carregada porem nao aplicada, a ser fechada nas fases 23/24/25.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Fase 22 concluida em codigo (3/3 planos): tokens + fonte (22-01), integracao em App.tsx (22-02), seletor de tema na config (22-03).
- **Bloqueios/pendencias carregadas para frente:**
  1. Verificacao humana em device/emulador da fase 22 (adiada) — fazer na fase 25 ou pelo usuario.
  2. VIS-02 — aplicar `theme.typography.*` (que carrega o `fontFamily` Nunito) aos textos durante o restyling das fases 23/24, ou fechar explicitamente na fase 25.
- Fase 23 (Tela Principal Redesenhada) pode iniciar: o sistema de tema e os tokens tipograficos estao prontos para serem consumidos.

## Self-Check: PASSED

- FOUND: src/App.tsx
- FOUND: .planning/phases/22-sistema-de-tema-salvia-creme/22-03-SUMMARY.md
- FOUND commit: 39888f9

---
*Phase: 22-sistema-de-tema-salvia-creme*
*Completed: 2026-05-19*
