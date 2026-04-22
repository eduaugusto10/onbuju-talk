# SUMMARY - Phase 17 - Design System iOS (Tokens e Primitivos)

**Status:** Complete
**Data:** 2026-04-21

## Entregas

### Tokens em `src/theme.ts`
- **Cores iOS** — `systemBlue`, labels (label, secondaryLabel, tertiaryLabel, quaternaryLabel), fills (fill, secondaryFill, tertiaryFill, quaternaryFill), backgrounds (systemBackground, secondarySystemBackground, systemGroupedBackground, secondarySystemGroupedBackground), separadores (separator, opaqueSeparator), system grays (systemGray, systemGray2..6), semantica (destructive, success, warning) e high-contrast (highContrastBackground, highContrastText).
- **Tipografia** — 11 roles (largeTitle, title1, title2, title3, headline, body, callout, subheadline, footnote, caption1, caption2), cada um com `fontSize`, `lineHeight`, `fontWeight`.
- **Raios** — sm (8), md (12), lg (16), xl (20), pill (999). **Breaking** vs legacy: `md` mudou de 14 para 12 (sem consumidor externo).
- **Espacamento** — xs (4), sm (8), md (12), lg (16), xl (20), xxl (24) em escala 4-point. **Breaking** vs legacy: `xl` e `xxl` redefinidos (antes 24/32; sem consumidor externo).
- **Sombras** — 3 niveis iOS-like (sm, md, lg) com opacity/radius/offset sutis e `elevation` Android correspondente.
- JSDoc pt-BR no topo com exemplos de uso por grupo.
- Legacy exports preservados: `palette`, `tiles`, `CHILD_GRID_COLUMNS` (para header atual).

### Primitivos em `src/ui/`
Novo diretorio com 6 componentes + barrel:
- **`IOSButton`** — variantes `filled` | `tinted` | `plain`; tamanhos `sm`|`md`|`lg`; suporte a `icon`, `destructive`, `disabled`; touch target minimo 44x44; press feedback via opacity 0.6.
- **`IOSCard`** — container com `systemBackground`, `radii.lg`, `shadows.sm`, padding default `spacing.md`.
- **`IOSSectionHeader`** — titulo UPPERCASE em `footnote` + `secondaryLabel`, padding iOS-style.
- **`IOSListSection`** — grouped inset section: header opcional + card agrupando rows + footer opcional.
- **`IOSListRow`** — row grouped list: icon + label + accessory; separator hairline interno; cantos arredondados em `isFirst`/`isLast`; press feedback sutil.
- **`IOSBottomSheet`** — base com grabber 36x5, safe-area inset, `max-height 85%`, cantos superiores `radii.xl`, header opcional com left/right actions. Backdrop placeholder (overlay semi-transparente) — troca para BlurView acontece na Phase 19.
- **`src/ui/index.ts`** barrel com re-exports nomeados + types.

### Dependencias Nativas
- `expo-haptics` ^15.0.7 instalado via `npx expo install`.
- `expo-blur` ^15.0.7 instalado via `npx expo install`.
- Plugins registrados em `app.json` (sem config adicional).
- Consumo de codigo fica para Phases 19 (blur) e 20 (haptics).

### Prova de Conceito (Header)
- Header da tela principal em `src/App.tsx` adota tokens:
  - `colors.systemBackground` no `headerCard`.
  - `spacing.md`/`spacing.sm` no padding e gap.
  - `typography.title2` no titulo principal ("ONBUJU TALK").
  - `colors.label` no titulo.
  - `typography.caption2` + `colors.secondaryLabel` na tagline.
- Visual permanece equivalente; tokens agora funcionam end-to-end.

## Arquivos Criados / Alterados

### Criados
- `src/ui/IOSButton.tsx`
- `src/ui/IOSCard.tsx`
- `src/ui/IOSSectionHeader.tsx`
- `src/ui/IOSListSection.tsx`
- `src/ui/IOSListRow.tsx`
- `src/ui/IOSBottomSheet.tsx`
- `src/ui/index.ts`

### Alterados
- `src/theme.ts` — expandido com tokens iOS; legacy preservado parcialmente.
- `src/App.tsx` — header consome novos tokens.
- `app.json` — 2 plugins adicionados.
- `package.json` / `package-lock.json` — 2 deps adicionadas.

## Validacao

- `npm run lint` — **PASS** (tsc --noEmit limpo).
- `npm run test -- --runInBand` — 22 passing, 4 pre-existing failures (arasaacService network — inherited do baseline conforme REQUIREMENTS v5; nenhum novo failure).
- Nenhum novo erro de runtime esperado; tokens e primitivos sao stateless e nao afetam fluxos existentes.

## Decisoes

- **Legacy `palette`/`tiles`/`CHILD_GRID_COLUMNS` preservados** no `theme.ts` para nao quebrar header/grid atuais durante a transicao. Remocao final prevista para Phase 21.
- **`IOSBottomSheet` usa `Modal` nativo como host** e backdrop semi-transparente simples. BlurView entra em Phase 19.
- **Sem fontFamily custom** — usa system default (SF Pro no iOS, Roboto no Android).
- **Sem animacoes reanimated** — primitivos usam `Pressable` opacity feedback apenas.
- **Testes unitarios dos primitivos** nao criados (opcional segundo CONTEXT.md). Suite existente nao foi afetada.

## Gotchas para Phases 18-20

1. **Valores de `radii`/`spacing` mudaram** — se algum codigo futuro importar esses tokens esperando os valores antigos (ex.: xl: 24, md: 14), vai quebrar visualmente. Todos os consumidores novos devem ler este SUMMARY e o docblock em `theme.ts`.
2. **`colors.fill` e semi-transparente** (rgba com alpha 0.2) — usar em pair com `systemBackground` para contraste correto.
3. **Cores high-contrast** continuam sendo gerenciadas via `contrastMode === 'alto'` no consumidor (App.tsx), nao dentro dos tokens.
4. **`IOSListRow` espera `isFirst`/`isLast`** para arredondar cantos. Quando dentro de `IOSListSection`, o consumidor precisa passar esses flags manualmente (Phase 20 fara isso no config rework).
5. **`IOSBottomSheet` header** aceita `leftAction`/`rightAction` com `bold: true` para o action primario (padrao iOS "Pronto"/"Salvar" em bold).
6. **`expo-haptics`/`expo-blur`** requerem dev client ou Expo Go com plugins — em Expo Go standard funcionam direto; em producao requer `npx expo prebuild` ou EAS build.

## Dependencias

- **Bloqueia:** nenhuma (inicio da v5).
- **Desbloqueia:** Phase 18 (tokens para grid/categorias/composer/search), Phase 19 (`IOSBottomSheet` + BlurView), Phase 20 (`IOSListSection`/`IOSListRow` + haptics).

## Progress

- Phase 17 1/1 plan complete — ready to start Phase 18.
