---
plan: 24-02
phase: 24
status: complete
requirements: [CFG-01, CFG-02]
tags: [config, drill-down, app-group, voz, acessibilidade, aparencia, salvia-creme]
files_modified:
  - src/App.tsx
commits:
  - dec7098
  - 3ede13f
  - 29b2ff9
metrics:
  duration_minutes: 5
  tasks_completed: 3
  files_changed: 1
  completed: 2026-05-20
---

# Plano 24-02 — Grupo App restilizado (Voz / Acessibilidade / Aparencia)

Sub-telas do grupo "App" do drill-down (criado em 24-01) passam do JSX legado denso para o padrao "uma coisa por tela" tokenizado — cards em surface Salvia & Creme, cabecalhos UPPERCASE muted, controles existentes (OptionChip / Switch) preservados.

## Resultado
- **Task 1** (commit `dec7098`): 9 novos style keys em `makeStyles(theme)` — `drillSectionTitle`, `drillSectionCard`, `drillFieldLabel`, `drillFieldHint`, `drillChipRow`, `drillToggleRow`, `drillPrimaryButton`+`Text`, `drillSecondaryButton`+`Text`, `drillDangerButton`+`Text`. Todos tokenizados via `theme.typography`, `theme.colors`, `theme.spacing`, `theme.radii`, `theme.shadows`. Nenhuma chave legada removida.
- **Task 2** (commit `3ede13f`): Sub-tela `'voz'` reescrita — 2 cards (VELOCIDADE / TOM) com label do valor atual e 3 chips (0.8 / 1.0 / 1.2) cada; botao "Testar voz" como acao primaria salvia preenchida (`drillPrimaryButton`). Handlers verbatim: `setRate`, `setPitch`, `Speech.speak('Olá, esta é a voz do aplicativo.', { language: 'pt-BR', rate, pitch })`. Removido `isHighContrast` / `highContrast` — tema Sereno Escuro cobre o caso noturno via tokens.
- **Task 3** (commit `29b2ff9`): Sub-telas `'acessibilidade'` e `'aparencia'` reescritas.
  - **Acessibilidade:** card TEMA DO APLICATIVO com hint pt-BR + 3 chips (Sálvia & Creme / Terracota / Sereno Escuro); card FEEDBACK com `drillToggleRow` (label + Switch nativo tematizado via `theme.colors.border`/`primary`) e hint pt-BR. Handlers verbatim: `setThemeName`, `setVisualFeedbackEnabled`.
  - **Aparencia** (antes "Perfil"): card ESCALA DA INTERFACE com 3 chips (Compacto / Padrao / Confortavel); card IMAGENS POR LINHA mapeando `GRID_COLUMNS_OPTIONS`. Handlers verbatim: `setUiScale`, `setGridColumns`.

## Decisoes
- **`OptionChip` sem `highContrast`** em todas as 3 sub-telas. A paleta nova tem coerencia interna; o caso noturno e tratado pela escolha do tema "Sereno Escuro" (que ja inverte `colors.surface`/`text`/`border` no proprio token), em vez de um overlay binario `highContrast`. Reduz acoplamento legado e elimina branches duplicados.
- **`<>` fragmento em vez de `configSectionCard` externo.** O `drillSectionCard` ja e o cartao do drill-down; o cartao externo legado adicionava padding/borda redundantes. Cada secao agora vira seu proprio card titulado, como no sketch 004 variante A.
- **Switch tematizado via `theme.colors.border`** (track off) em vez de `#D1D1D6` hardcoded — mantem coerencia com o tema ativo (no Sereno Escuro o track off fica em `#423F36` automaticamente).
- **`drillPrimaryButton` em vez de `modalButtonPrimary`** para o botao "Testar voz" — usa `theme.colors.primary` (salvia) e `theme.radii.full`, mais alinhado ao sistema Salvia & Creme.
- **Texto branco literal `'#FFFFFF'`** em `drillPrimaryButtonText` — tokens de tema nao tem `onPrimary` dedicado; salvia e escura o suficiente para contraste WCAG.

## Verificacao automatica
- `npm run lint` (`tsc --noEmit`): limpo.
- `npm run test --runInBand`: 22/26 (4 falhas pre-existentes em `arasaacService.test.ts` herdadas, sem novas falhas — exatamente o baseline do plano).
- `grep "fontFamily: '" src/App.tsx` retorna 0 (VIS-02 segue fechado).
- `grep "configRoute === 'voz'" src/App.tsx` retorna 1; `'acessibilidade'` retorna 1; `'aparencia'` retorna 1.
- 9 tokens `drill*` presentes em `makeStyles` (linhas 6126-6196).
- Blocos voz/acessibilidade/aparencia nao contem `styles.modalSectionTitle`, `styles.modalHint`, `styles.settingActions`, `styles.iosToggleRow`, `styles.modalButtonPrimary` (anti-regressao OK).
- Handlers preservados verbatim: `setRate`, `setPitch`, `Speech.speak`, `setThemeName`, `setVisualFeedbackEnabled`, `setUiScale`, `setGridColumns`.

## Desvios do plano
Nenhum. Plano executado exatamente como escrito (inclusive cardinalidades, copy pt-BR e nomes de tokens).

## Self-Check: PASSED
- FOUND: `.planning/phases/24-configuracoes-agrupadas-com-drill-down/24-02-SUMMARY.md`
- FOUND: commit `dec7098` (Task 1)
- FOUND: commit `3ede13f` (Task 2)
- FOUND: commit `29b2ff9` (Task 3)

## Proximos planos
- 24-03 (grupo Conteudo da crianca: Vocabulario, Frases, Simbolos, Categorias, Rotina, Cenas)
- 24-04 (grupo Cuidador: Senha 3 estados + Chave IA + Sair)
