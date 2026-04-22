# Phase 17: Design System iOS (Tokens e Primitivos) - Context

**Gathered:** 2026-04-21
**Status:** Ready for planning
**Mode:** Auto-generated (smart-discuss --auto; ROADMAP é spec)

<domain>
## Phase Boundary

Estabelecer o design system iOS do Fala Mobile: tokens centralizados em `src/theme.ts` (cores system-style, tipografia iOS, raios, espaçamentos e sombras sutis) e um conjunto de primitivos reutilizáveis em `src/ui/` (IOSButton, IOSCard, IOSListSection, IOSListRow, IOSSectionHeader, IOSBottomSheet base). Instalar `expo-haptics` e `expo-blur` com plugins em `app.json`. Adotar tokens em ao menos um componente existente como prova de conceito (header). Escopo estritamente visual — nenhuma mudança de comportamento.

</domain>

<decisions>
## Implementation Decisions

### DS-Tokens (Theme Shape)
- **D-01:** Expandir o arquivo existente `src/theme.ts` (não criar arquivo novo) adicionando os objetos iOS: `colors`, `typography`, `radii`, `spacing`, `shadows`. Manter os exports legacy (`palette`, `spacing`, `radii`, `typography`, `tiles`, `CHILD_GRID_COLUMNS`) durante a v5 — Phase 18+ migra consumidores; remoção dos legacy fica como cleanup em Phase 21.
- **D-02:** `colors` segue nomenclatura iOS semântica: `systemBlue` (#007AFF), `label`, `secondaryLabel`, `tertiaryLabel`, `fill`, `secondaryFill`, `tertiaryFill`, `quaternaryFill`, `systemBackground`, `secondarySystemBackground`, `systemGroupedBackground`, `secondarySystemGroupedBackground`, `separator`, `opaqueSeparator`, `systemGray`, `systemGray2..6`, `destructive`, `success`, `warning`, `highContrastBackground`, `highContrastText`. Valores inspirados no Human Interface Guidelines (light mode). Dark mode fica deferido para milestone futura.
- **D-03:** `typography` exporta tokens com `fontSize` + `lineHeight` + `fontWeight`: `largeTitle` (34/41/700), `title1` (28/34/700), `title2` (22/28/700), `title3` (20/25/600), `headline` (17/22/600), `body` (17/22/400), `callout` (16/21/400), `subheadline` (15/20/400), `footnote` (13/18/400), `caption1` (12/16/400), `caption2` (11/13/400). Sem fontFamily (usa system default do React Native — SF Pro no iOS, Roboto no Android).
- **D-04:** `radii` exporta `sm: 8`, `md: 12`, `lg: 16`, `xl: 20`, `pill: 999` (conforme ROADMAP 8/12/16 + presets adicionais úteis).
- **D-05:** `spacing` exporta escala numérica `xs: 4`, `sm: 8`, `md: 12`, `lg: 16`, `xl: 20`, `xxl: 24` (conforme ROADMAP 4/8/12/16/20/24). Para evitar colisão com o export legacy `spacing`, o novo objeto é nomeado `spacing` também — o legacy tinha `xs/sm/md/lg/xl/xxl` com valores ligeiramente diferentes (xl era 24, xxl 32); o merge é compatível para `xs/sm/md/lg` e redefine `xl/xxl`. Dado que nenhum consumidor fora de `CHILD_GRID_COLUMNS` usa esses valores hoje (confirmado via grep), substituir é seguro.
- **D-06:** `shadows` exporta 3 níveis iOS-like sutis: `sm` (opacity 0.05, radius 2, offset {0,1}), `md` (opacity 0.08, radius 6, offset {0,2}), `lg` (opacity 0.12, radius 16, offset {0,8}). Todos com `elevation` correspondente para Android.

### UI Primitives (src/ui/)
- **D-07:** Criar diretório novo `src/ui/` com um arquivo por primitivo. Cada primitivo é um componente functional stateless (com `memo` onde apropriado), tipado em TypeScript strict, consumindo apenas os tokens de `src/theme.ts`. Todos expõem `style` e `testID` pass-through.
- **D-08:** Primitivos a criar na Phase 17: `IOSButton.tsx` (variants `filled` | `tinted` | `plain`, props `label`, `onPress`, `disabled`, `icon?`, `size?` 'sm'|'md'|'lg', `destructive?`), `IOSCard.tsx` (container com `radii.lg` + `shadows.sm` + padding), `IOSListSection.tsx` (grouped list section: header uppercase + card agrupando rows com hairlines internas e cantos arredondados no primeiro/último), `IOSListRow.tsx` (label esquerda, accessory direita: `Switch`, chevron, texto de valor, ou node custom — separator hairline interno), `IOSSectionHeader.tsx` (texto uppercase `caption1`/`footnote` em `secondaryLabel` com padding padrão acima/abaixo), `IOSBottomSheet.tsx` (container base ancorado no bottom com grabber 36x5 arredondado, safe-area inset, `max-height 85%`, header opcional com "Cancelar"/"Pronto" e título central — o backdrop com BlurView é aplicado na Phase 19, mas o primitivo já aceita prop `onRequestClose` e layout pronto).
- **D-09:** `IOSBottomSheet` na Phase 17 ainda usa `Modal` nativo do React Native como host (não troca a implementação). O `BlurView` backdrop e integração completa acontecem na Phase 19. Isso evita duplicar trabalho e mantém Phase 17 focada em tokens+primitivos.
- **D-10:** Exportar todos os primitivos via `src/ui/index.ts` (barrel file) para imports limpos: `import { IOSButton, IOSCard } from '../ui';`.

### Integrações Nativas
- **D-11:** Instalar `expo-haptics` e `expo-blur` via `npx expo install` (respeita versionamento do SDK 54). Registrar plugins em `app.json`.
- **D-12:** Haptics e blur NÃO são consumidos por código de produção na Phase 17 — apenas instalados e configurados. O consumo ocorre nas Phase 19 (blur backdrop) e Phase 20 (haptics em toques). Phase 17 valida instalação via smoke test: app roda (`npm run start`) sem erros e `npm run lint` limpo.

### Prova de Conceito (Header)
- **D-13:** Adotar os novos tokens no header atual (na parte superior da tela principal em `src/App.tsx`), substituindo valores hardcoded de cor/tipografia/espaçamento. Critério: fica indistinguível visualmente do header pré-refatoração na v4 (mesma hierarquia/cores efetivas) OU melhora sutil em alinhamento iOS — o objetivo é provar que os tokens funcionam end-to-end sem introduzir regressão visual. Mudança maior de layout do header acontece na Phase 18.

### Documentação
- **D-14:** Adicionar docblock em pt-BR no topo de `src/theme.ts` (comentário JSDoc) com: (a) visão geral do design system iOS, (b) exemplo de uso para cada grupo de tokens (colors, typography, radii, spacing, shadows), (c) nota sobre legacy exports e quando migrar.

### Claude's Discretion
- Arquivo `src/ui/index.ts` barrel file: estrutura `export *` ou re-exports nomeados — Claude escolhe.
- Estrutura interna de cada primitivo (hooks internos, useMemo, split em sub-componentes) — Claude escolhe.
- Testes unitários básicos dos primitivos (smoke tests com `react-native-testing-library`) — Claude decide se adiciona; não é entrega obrigatória da Phase 17.
- Nome exato das props quando ambíguas (seguir convenções RN: `onPress`, `disabled`, `style`, `testID`).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Specification
- `.planning/ROADMAP.md` §"Phase 17 - Design System iOS (Tokens e Primitivos)" — Deliverables, success criteria, UI hint.
- `.planning/REQUIREMENTS.md` §"Design System (DS)" — DS-01, DS-02, DS-03 requirements (pt-BR).

### Project Context
- `.planning/PROJECT.md` — Vision, simplicidade como restrição dura.
- `.planning/STATE.md` — Sequência de fases v5.
- `CLAUDE.md` — Convenções do projeto (TypeScript strict, pt-BR UI, padrões de service).

### Code References
- `src/theme.ts` — Arquivo a expandir (exports legacy permanecem).
- `src/App.tsx` — Monolito onde header vive (~linha do render principal); único consumidor de `theme.ts` hoje (`CHILD_GRID_COLUMNS`).
- `app.json` — Registrar plugins `expo-haptics` e `expo-blur`.

### External Design References (non-file)
- Apple Human Interface Guidelines: Color system (system blue #007AFF), Typography scale (largeTitle 34pt .. caption2 11pt), Grouped list inset style.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/theme.ts` — arquivo existente, pequeno; apenas `CHILD_GRID_COLUMNS` é consumido externamente. Seguro expandir.
- `src/App.tsx` — monolito React functional component. Todos os estilos via `StyleSheet.create` inline. Sem store global, sem navigation.
- `src/services/` — não relevante para Phase 17 (serviços de dados, não UI).
- Sem biblioteca de UI atualmente; usar apenas primitivos nativos de `react-native` (`View`, `Text`, `Pressable`, `Switch`, `Modal`).

### Established Patterns
- TypeScript strict mode — tudo tipado.
- Componentes são funcionais + hooks; nenhum class component.
- Strings de UI em pt-BR; identificadores de código em inglês.
- Sem feature flags nem backward-compat shims desnecessários.

### Integration Points
- `src/theme.ts` — ponto central de tokens; importado por `src/App.tsx` e (futuramente) por `src/ui/*`.
- `src/ui/` — novo diretório; sem colisões com estrutura atual.
- `app.json` expo config — plugins block para expo-haptics/expo-blur.

### Dependency Notes
- `expo` SDK 54 (confirmar via `package.json`).
- `expo-haptics` e `expo-blur` — versões alinhadas ao SDK 54 via `npx expo install`.

</code_context>

<specifics>
## Specific Ideas

- **Paleta iOS light mode primeiro**, dark mode/semantic colors adiados (conforme REQUIREMENTS.md §Future Requirements). O modo `contrastMode === 'alto'` pré-existente continua a ser respeitado via overrides no consumo dos tokens (não dentro dos próprios tokens nesta fase).
- **Não trocar a fontFamily** — usar `undefined` (system default). Sem SF Pro explícito; sem Roboto explícito. Simplifica e mantém look nativo em cada plataforma.
- **Não introduzir react-native-reanimated ou outras libs de animação** — fora de escopo. Primitivos usam `Pressable` com `opacity` feedback apenas.
- **Usar `StyleSheet.hairlineWidth`** para separadores dos IOSListRow/IOSListSection — é a forma iOS-correta em RN.

</specifics>

<deferred>
## Deferred Ideas

- **Dark mode completo via semantic colors iOS** — migrar de estática para semantic em milestone futura. (REQUIREMENTS.md ja registra.)
- **SF Symbols (expo-symbols)** — substituir emojis por glifos iOS. Exige native module; fora do escopo v5.
- **Large title collapse animado** — nav bar iOS com collapse ao rolar. Precisaria reanimated. Deferido.
- **Spring animations iOS (react-native-reanimated)** — deferido para futuro.
- **Context menus (long press menu iOS)** — deferido.
- **Swipe actions em rows** — deferido.
- **Testes unitários dos primitivos** — opcional em Phase 17; pode virar plan separado em Phase 21 se necessário para regressão.
- **Remover exports legacy de `theme.ts`** — após Phase 18+ migrarem consumidores. Endereçado como cleanup na Phase 21.

</deferred>

---

*Phase: 17-design-system-ios*
*Context gathered: 2026-04-21*
