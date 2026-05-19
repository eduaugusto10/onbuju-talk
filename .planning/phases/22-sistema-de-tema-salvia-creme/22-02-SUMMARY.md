---
phase: 22-sistema-de-tema-salvia-creme
plan: 02
subsystem: theme-integration
tags: [theme, runtime, fonts, makeStyles, migration]
requires:
  - "Theme / ThemeName / themes / resolveTheme — API de tema (plano 22-01)"
  - "NUNITO_FONT_MAP — mapa de fonte para useFonts (plano 22-01)"
provides:
  - "themeName — estado de tema em runtime em src/App.tsx"
  - "STORAGE_KEYS.themeName — chave de persistencia do tema escolhido"
  - "makeStyles(theme) — factory de StyleSheet parametrizada por tema"
  - "isHighContrast = isDarkTheme — alias para as ~162 refs JSX existentes"
  - "shell tematizado — SafeAreaView, fundos e elemento StatusBar pelo tema ativo"
affects:
  - "fase 23 — restyling de header/grade/composer consome makeStyles + theme"
  - "fase 24 — tela de config consome o seletor de tema (plano 22-03 adiciona o seletor)"
tech-stack:
  added: []
  patterns:
    - "Factory makeStyles(theme) consumida via useMemo(() => makeStyles(theme), [theme])"
    - "Espelho de modulo (moduleStyles/moduleTheme) para auxiliares definidos fora de App"
    - "Boot gate por fonte: !fontsLoaded || isBootHydrating bloqueia a UI ate a fonte pronta"
key-files:
  created: []
  modified:
    - "src/App.tsx — estado themeName, makeStyles, fonte Nunito, migracao, shell"
decisions:
  - "Helpers fora de App leem moduleStyles/moduleTheme (espelho de modulo) — evita refatorar 13 componentes + call sites mantendo a reatividade ao tema"
  - "Toggle 'Alto contraste' (UI legada) re-cabeado para alternar themeName default<->sereno-escuro ate o plano 03 trazer o seletor de 3 opcoes"
  - "Tokens legacy referenciados em estilos nao-shell foram inlinados como valores literais (nao tokenizados) para garantir zero regressao visual"
metrics:
  duration: "~12 min"
  completed: 2026-05-19
---

# Phase 22 Plan 02: Integracao do Sistema de Tema "Salvia & Creme" Summary

Integrou a API de tema "Salvia & Creme" em `src/App.tsx`: carregamento da fonte Nunito no boot, estado `themeName` em runtime substituindo `contrastMode`, factory `makeStyles(theme)` consumida via `useMemo`, persistencia com migracao do valor legado de contraste e aplicacao do tema ao shell do app.

## What Was Built

- **Task 1 — Estado, persistencia, migracao e fonte.**
  - Import migrado para a API nova (`NUNITO_FONT_MAP`, `resolveTheme`, `Theme`, `ThemeName`); `CHILD_GRID_COLUMNS` mantido; `useFonts` de `expo-font` adicionado.
  - Tipo `ContrastMode` removido; `STORAGE_KEYS.contrastMode` substituido por `STORAGE_KEYS.themeName` (`'theme_name'`).
  - Estado `[themeName, setThemeName]` (`'default'`) substitui `[contrastMode, setContrastMode]`. Tema resolvido via `const theme = useMemo(() => resolveTheme(themeName), [themeName])`.
  - Derivados obrigatorios `const isDarkTheme = theme.isDark;` e `const isHighContrast = isDarkTheme;` — o alias preserva as ~162 refs `isHighContrast` no JSX.
  - `const [fontsLoaded] = useFonts(NUNITO_FONT_MAP)`; gate de boot agora `if (!fontsLoaded || isBootHydrating)` — a UI so renderiza com a fonte pronta.
  - Hidratacao no boot useEffect: le `STORAGE_KEYS.themeName` + a chave legada `'contrast_mode'`; migra (`'alto'` -> `'sereno-escuro'`, ausente/`'padrao'` -> `'default'`), persiste o valor migrado e remove `'contrast_mode'`.
  - useEffect de persistencia on-change re-apontado para `STORAGE_KEYS.themeName`.

- **Task 2 — Factory makeStyles e shell.**
  - `const styles = StyleSheet.create({...})` convertido em `function makeStyles(theme: Theme) { return StyleSheet.create({...}); }` no fim do modulo; `styles` consumido em `App` via `useMemo(() => makeStyles(theme), [theme])`.
  - Shell tematizado: `styles.safeArea` usa `theme.colors.bg`; `styles.safeAreaHighContrast` virou no-op `{}` (preserva os ~3 arrays JSX sem mudanca); elemento `<StatusBar>` adicionado no return principal com `barStyle` por `theme.isDark` e `backgroundColor={theme.colors.bg}`.
  - 5 sites `placeholderTextColor` migrados para `theme.colors.textSoft`.
  - Estilos nao-shell que referenciavam tokens legacy (`colors`/`shadows`/`spacing`/`typography`) tiveram esses tokens inlinados como valores literais identicos — sem tokenizacao, sem mudanca visual (phases 23/24 reestilizam tela a tela).

## Key Implementation Details

- **Espelho de modulo para os auxiliares.** Os 13 componentes auxiliares (`CategoryButton`, `ConfigTab`, `ConfigNavItem`, `OptionChip`, `ActionButton`, `SymbolCard`, `RoutineStepCard`, `SceneViewer`, `SceneEditor`, `AudioRecorderControls`, `PhraseCard`, `CustomSymbolCard`) sao definidos fora de `App` e usavam o `styles` de modulo. Como `styles` agora e local a `App`, foi criado um espelho de modulo `moduleStyles` / `moduleTheme` (inicializado com o tema `default`). `App` atualiza os espelhos no inicio do seu render; os auxiliares — que sempre renderizam como filhos de `App` — leem `const styles = moduleStyles;` (e `const theme = moduleTheme;` no `SceneEditor`). Isso mantem os auxiliares reativos ao tema sem refatorar 13 componentes e todos os seus call sites.
- O `tsc` nao detecta troca incorreta de token de cor; por isso a regra adotada para estilos nao-shell foi inlinar os valores **literais** exatos dos tokens legacy (ex.: `colors.systemBlue` -> `'#007AFF'`, `colors.systemBackground` -> `'#FFFFFF'`, `...shadows.sm` -> objeto literal), garantindo zero regressao visual fora do shell.
- `makeStyles` e uma function declaration, portanto hoisted — a inicializacao `let moduleStyles = makeStyles(moduleTheme)` (declarada acima na ordem do arquivo) funciona em tempo de avaliacao do modulo.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Auxiliares fora de App perderam acesso a `styles`**
- **Found during:** Task 2
- **Issue:** Converter `styles` de const de modulo para variavel local de `App` (via `useMemo`) quebrou 13 componentes auxiliares definidos fora de `App` que referenciavam `styles` (e `theme` em 2 sites do `SceneEditor`) — ~150 erros `TS2304 Cannot find name 'styles'`.
- **Fix:** Criado espelho de modulo `moduleStyles` / `moduleTheme` (inicializado com o tema `default`), atualizado por `App` no inicio do render; cada auxiliar lê `const styles = moduleStyles;`. Mantem a reatividade ao tema sem refatorar todos os call sites.
- **Files modified:** src/App.tsx
- **Commit:** 177fa8b

**2. [Rule 3 - Blocking] Switch "Alto contraste" referenciava estado removido**
- **Found during:** Task 2
- **Issue:** O `<Switch>` da secao Acessibilidade usava `contrastMode === 'alto'` e `setContrastMode`, que deixaram de existir apos a Task 1 — quebraria a compilacao.
- **Fix:** Switch re-cabeado para `value={isDarkTheme}` / `onValueChange={v => setThemeName(v ? 'sereno-escuro' : 'default')}`; `trackColor` com valores literais + `theme.colors.primary`. O modo escuro continua acionavel ate o plano 03 substituir este toggle pelo seletor de 3 temas.
- **Files modified:** src/App.tsx
- **Commit:** 177fa8b

## Verification

- `npm run lint` (`tsc --noEmit`): passa limpo, sem erros.
- `npm run test`: `4 failed, 22 passed, 26 total` — identico ao baseline (as 4 falhas pre-existentes de `arasaacService`). `App.test.tsx` rodado isoladamente: `4 failed, 16 passed, 20 total` — identico ao baseline pristino; nenhuma falha nova introduzida.
- Greps de acceptance: `STORAGE_KEYS.themeName`, `theme_name`, `const [themeName, setThemeName]`, `resolveTheme(themeName)`, `const isHighContrast = isDarkTheme`, `useFonts(NUNITO_FONT_MAP)`, `sereno-escuro`, `removeItem('contrast_mode')`, `function makeStyles(theme: Theme)`, `useMemo(() => makeStyles(theme)`, `<StatusBar`, `barStyle`, `theme.colors.bg` — todos confirmados. `ContrastMode` retorna 0; `StyleSheet.create` retorna 1; `theme.colors.textSoft` retorna 5.
- Revisao de diff: apenas o shell (`safeArea`, `safeAreaHighContrast`, elemento `StatusBar`) mudou de valor visual; estilos nao-shell tiveram tokens legacy inlinados como literais identicos.

## Known Stubs

Nenhum. O seletor de tema de 3 opcoes na UI de configuracoes e do plano 22-03; o toggle legado de contraste foi re-cabeado para alternar default<->sereno-escuro como ponte ate la (documentado como deviation 2, comportamento intencional e temporario).

## Commits

- `177fa8b`: feat(22-02): integrar sistema de tema Salvia & Creme em App.tsx

## Self-Check: PASSED

- FOUND: src/App.tsx
- FOUND: .planning/phases/22-sistema-de-tema-salvia-creme/22-02-SUMMARY.md
- FOUND commit: 177fa8b
