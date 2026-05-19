# Phase 22: Sistema de Tema "Salvia & Creme" - Context

**Gathered:** 2026-05-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Estabelece a fundacao de design da milestone v6 em `src/theme.ts`: a paleta
terrosa "Salvia & Creme", a fonte Nunito e um sistema de 3 temas selecionaveis.
Inclui o mecanismo de troca de tema e a aplicacao no shell do app (fundos,
SafeArea). NAO inclui o restyling completo da tela principal (fase 23) nem da
tela de configuracoes (fase 24) — apenas a infraestrutura visual que essas fases
vao consumir.

Fonte de design: skill `sketch-findings-fala` (`.claude/skills/sketch-findings-fala/`),
em especial `references/fundamentos-visuais.md` e `sources/themes/*.css`.

</domain>

<decisions>
## Implementation Decisions

### Tokens e tipografia em theme.ts
- Os tokens iOS atuais (`systemBlue`, system grays, grouped backgrounds) sao SUBSTITUIDOS pelos tokens "Salvia & Creme" — a estetica v5 sai de cena; manter os dois conjuntos confunde.
- A fonte Nunito e carregada via `@expo-google-fonts/nunito` + `expo-font` (padrao Expo, sem rebuild nativo).
- Pesos da Nunito incluidos: 400, 600, 700, 800 (cobre corpo, semibold, bold e extrabold usados nos sketches).
- Os tokens portam os valores de `sources/themes/default.css`: paleta (salvia/ouro/terracota/creme/texto quente), raios generosos (16/22/30px), sombras suaves tingidas de quente.

### Sistema de 3 temas e troca
- O estado `contrastMode` ('padrao' | 'alto') existente e SUBSTITUIDO por `themeName` ('default' | 'terracota' | 'sereno-escuro'). Na hidratacao, migrar o valor salvo: 'alto' -> 'sereno-escuro', 'padrao'/ausente -> 'default'.
- "Sereno Escuro" e o modo escuro calmo que substitui o alto-contraste preto/amarelo agressivo.
- Os estilos passam a ser gerados por uma factory `makeStyles(theme)` chamada com `useMemo(() => makeStyles(theme), [theme])` — o `StyleSheet.create` estatico atual nao suporta troca de tema em runtime.
- Persistencia: nova chave `STORAGE_KEYS.themeName`; hidratar no boot `useEffect`, persistir on change (padrao das settings existentes). Migrar o valor da chave antiga de contraste.

### Escopo da fase 22
- A fase 22 NAO reestiliza todas as telas. Entrega: tokens + Nunito + mecanismo de troca de tema + aplicacao no shell (SafeAreaView, fundos de tela, status bar). O restyling de header/grade/composer e da config sao das fases 23 e 24.
- O seletor de tema (3 opcoes) e adicionado a tela de configuracoes EXISTENTE (secao de acessibilidade/aparencia), substituindo o toggle de alto-contraste. A tela de config redesenhada vem na fase 24.
- Os 3 temas CSS dos sketches (`default.css`, `terracota.css`, `sereno-escuro.css`) sao portados para 3 objetos de tema em `theme.ts`.

### Claude's Discretion
- Forma exata da factory `makeStyles` e da API de tema (objeto unico vs sub-objetos).
- Nomes internos dos tokens (manter alinhados aos do `fundamentos-visuais.md`).
- Como o `theme` resolvido e propagado dentro do componente monolitico `App` (variavel local via useMemo; sem Context necessario num app single-component).

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/theme.ts` — modulo de tokens existente (cores iOS, tipografia, raios, espacamento, sombras). Sera reescrito com os tokens da paleta nova.
- `STORAGE_KEYS` const em `src/App.tsx` — centraliza chaves AsyncStorage; adicionar `themeName`.
- Boot `useEffect` em `src/App.tsx` — hidrata settings persistidas; ponto de migracao de contrastMode->themeName.
- Estado `contrastMode` / `isHighContrast` em `src/App.tsx` — sera substituido pelo seletor de tema.

### Established Patterns
- App single-screen: `App.tsx` reexporta `src/App.tsx`, componente funcional monolitico; sem store global, sem navigation.
- Nova setting persistida: adicionar chave a `STORAGE_KEYS`, hidratar no boot useEffect, persistir on change (convencao do CLAUDE.md).
- Strings de UI em pt-BR; identificadores de codigo em ingles. TypeScript strict.
- `npm run lint` = `tsc --noEmit` (gate de lint). `npm run test` = Jest.

### Integration Points
- `src/theme.ts` — onde os tokens novos e a factory de temas vivem.
- `src/App.tsx` — consumo dos tokens, estado `themeName`, `makeStyles(theme)` via useMemo, seletor de tema na config.
- `app.json` / fontes — registro do `expo-font` / `@expo-google-fonts/nunito`.

</code_context>

<specifics>
## Specific Ideas

- Paleta e valores exatos: ver `.claude/skills/sketch-findings-fala/references/fundamentos-visuais.md` e `sources/themes/default.css` (default), `terracota.css`, `sereno-escuro.css`.
- Restricao dura: simplicidade acima de riqueza de features (publico autista); reduzir estimulo sensorial guia as escolhas de cor.
- Sai o azul iOS `#007AFF` como cor primaria; texto e quase-preto quente, nunca preto puro.

</specifics>

<deferred>
## Deferred Ideas

- Restyling completo da tela principal (header, grade, cards, composer) — fase 23.
- Redesign da tela de configuracoes em drill-down — fase 24.
- Ajuste dos pictogramas reais do ARASAAC na paleta nova — Future Requirements.

</deferred>
