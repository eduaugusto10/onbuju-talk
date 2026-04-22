# PLAN - Phase 17 - Design System iOS (Tokens e Primitivos)

## Objetivo
Estabelecer o design system iOS do Fala Mobile: tokens centralizados em `src/theme.ts` (cores system-style, tipografia iOS, raios, espacamentos, sombras sutis) e um conjunto de primitivos reutilizaveis em `src/ui/` (IOSButton, IOSCard, IOSListSection, IOSListRow, IOSSectionHeader, IOSBottomSheet base). Instalar `expo-haptics` e `expo-blur` com plugins em `app.json`. Adotar os tokens no header atual como prova de conceito. Escopo estritamente visual.

## Requisitos Mapeados
- DS-01: paleta iOS (systemBlue, labels, fills, grouped backgrounds, system grays) como tokens em `src/theme.ts`.
- DS-02: escala tipografica iOS (largeTitle 34pt, title1 28pt, title2 22pt, body 17pt, footnote 13pt, caption 11pt) como tokens.
- DS-03: raios 8/12/16px, sombras sutis iOS-like, escala de espacamento 4/8/12/16/20/24 como tokens.

## Escopo
- **Expansao de `src/theme.ts`** com novos objetos iOS:
  - `colors`: systemBlue, label, secondaryLabel, tertiaryLabel, fill, secondaryFill, tertiaryFill, quaternaryFill, systemBackground, secondarySystemBackground, systemGroupedBackground, secondarySystemGroupedBackground, separator, opaqueSeparator, systemGray, systemGray2..6, destructive, success, warning, highContrastBackground, highContrastText.
  - `typography`: largeTitle, title1, title2, title3, headline, body, callout, subheadline, footnote, caption1, caption2 (cada um com `fontSize`, `lineHeight`, `fontWeight`).
  - `radii`: sm (8), md (12), lg (16), xl (20), pill (999).
  - `spacing`: xs (4), sm (8), md (12), lg (16), xl (20), xxl (24).
  - `shadows`: sm (opacity 0.05, radius 2, offset {0,1}, elevation 1), md (opacity 0.08, radius 6, offset {0,2}, elevation 3), lg (opacity 0.12, radius 16, offset {0,8}, elevation 8).
  - Manter exports legacy (`palette`, `tiles`, `CHILD_GRID_COLUMNS`) no arquivo; nao ha necessidade de manter o legacy `spacing`/`radii`/`typography` ja que apenas `CHILD_GRID_COLUMNS` e importado externamente (grep confirmado).
  - JSDoc em pt-BR no topo do arquivo com exemplos de uso para cada grupo.

- **Novo diretorio `src/ui/`** com primitivos (um arquivo por componente):
  - `IOSButton.tsx`: variantes `filled` | `tinted` | `plain`; props `label`, `onPress`, `variant`, `size?` ('sm'|'md'|'lg', default 'md'), `icon?`, `disabled?`, `destructive?`, `style?`, `testID?`.
    - `filled`: bg `colors.systemBlue` (ou `destructive` se flag), texto branco, peso 600.
    - `tinted`: bg `colors.fill`, texto `systemBlue` (ou `destructive`), peso 500.
    - `plain`: sem bg, texto `systemBlue`, peso 500.
    - Touch target minimo 44x44. Opacity feedback 0.6 via `Pressable`.
  - `IOSCard.tsx`: container com `systemBackground`, `radii.lg`, `shadows.sm`, padding `spacing.md`. Props: `children`, `padding?`, `style?`, `testID?`.
  - `IOSSectionHeader.tsx`: texto `caption1`/`footnote` uppercase em `secondaryLabel`, padding horizontal 16 e vertical 6. Props: `title`, `style?`.
  - `IOSListSection.tsx`: grouped inset section. Wrap dos filhos em card branco (`secondarySystemGroupedBackground`) com `radii.lg`, `shadows.sm`. Opcionalmente mostra `IOSSectionHeader` acima via prop `header`. Props: `header?`, `footer?`, `children`, `style?`.
  - `IOSListRow.tsx`: row de grouped list. Layout: icone opcional + label (flex 1) + accessory (direita). Separator hairline (`StyleSheet.hairlineWidth` em `separator`) na base exceto no ultimo item. Cantos arredondados no primeiro/ultimo quando parte de section. Press feedback. Props: `label`, `accessory?`, `onPress?`, `icon?`, `isFirst?`, `isLast?`, `style?`, `testID?`.
  - `IOSBottomSheet.tsx`: host = `Modal` nativo RN (nao troca para lib externa). Container ancorado no bottom com `SafeAreaView` inset, `max-height: 85%`, `borderTopLeftRadius/borderTopRightRadius: radii.xl`, bg `systemBackground`. Grabber: `<View>` 36x5 com `borderRadius 3`, bg `systemGray`, margin vertical 8, centralizado. Header opcional com padding 16: esquerda (`leftAction` - default "Cancelar"), centro (`title`), direita (`rightAction` - default "Pronto", cor `systemBlue`, peso 600). Tap no backdrop dispara `onRequestClose`. Nota: o backdrop com BlurView (via expo-blur) e aplicado em Phase 19 — aqui usar overlay semi-transparente simples (`rgba(0,0,0,0.4)`) como placeholder. Props: `visible`, `onRequestClose`, `title?`, `leftAction?`, `rightAction?`, `children`, `maxHeight?`, `style?`.
  - `index.ts` barrel com re-exports nomeados de todos os primitivos.

- **Adocao no header (prova de conceito)**:
  - Refatorar o header da tela principal em `src/App.tsx` substituindo valores hardcoded por tokens:
    - `colors.label` para cor do titulo.
    - `typography.title2` ou `typography.headline` para estilo do titulo (manter peso e tamanho coerentes com o atual).
    - `spacing.lg`/`spacing.md` para padding.
    - Manter texto, acoes e badges inalterados visualmente — o objetivo e provar que os tokens funcionam end-to-end sem regressao.

- **Instalacao de deps nativas**:
  - `npx expo install expo-haptics expo-blur` (versoes alinhadas ao SDK 54).
  - Registrar plugins em `app.json` sob `"plugins"`:
    - `"expo-haptics"` (sem config)
    - `"expo-blur"` (sem config)

- **Documentacao**:
  - JSDoc em pt-BR no topo de `src/theme.ts` com secoes: "Design System iOS", "Cores", "Tipografia", "Raios", "Espacamento", "Sombras", "Uso", e nota sobre legacy exports.

- **Smoke tests**:
  - `npm run lint` limpo.
  - `npm run test -- --runInBand` sem novas falhas (existing tests continuam passando).
  - App roda via `npm run start` sem crash (manual).

## Fora de Escopo
- Consumo de expo-haptics em codigo de producao (fica para Phase 20).
- Consumo de expo-blur / BlurView no IOSBottomSheet (fica para Phase 19).
- Refatoracao de categorias, search, grid, cards de simbolo, composer (fica para Phase 18).
- Dark mode / semantic colors adaptativos (deferido para milestone futura).
- SF Symbols via expo-symbols.
- Animacoes com react-native-reanimated.
- Remocao dos exports legacy (`palette`, `tiles`) — fica para cleanup na Phase 21.
- Testes unitarios dos primitivos — nao obrigatorios nesta fase; suite existente garante regressao geral.

## Arquivos Alvo
- `src/theme.ts` (expandir com novos tokens + docblock; preservar legacy exports)
- `src/ui/IOSButton.tsx` (novo)
- `src/ui/IOSCard.tsx` (novo)
- `src/ui/IOSSectionHeader.tsx` (novo)
- `src/ui/IOSListSection.tsx` (novo)
- `src/ui/IOSListRow.tsx` (novo)
- `src/ui/IOSBottomSheet.tsx` (novo)
- `src/ui/index.ts` (novo — barrel)
- `src/App.tsx` (adocao dos tokens apenas no header)
- `app.json` (plugins `expo-haptics`, `expo-blur`)
- `package.json` / `package-lock.json` (via `npx expo install`)

## Plano de Implementacao

1. **Instalacao das deps nativas**
   - Rodar `npx expo install expo-haptics expo-blur` (nao editar `package.json` manualmente).
   - Confirmar que `package.json` lista ambas com versoes alinhadas ao SDK 54.
   - Registrar plugins em `app.json`:
     ```json
     "plugins": [
       ...existentes,
       "expo-haptics",
       "expo-blur"
     ]
     ```
   - Rodar `npx expo-doctor` se disponivel para validar.

2. **Expansao de `src/theme.ts`**
   - Adicionar no topo do arquivo JSDoc em pt-BR com visao geral, exemplos por grupo e nota sobre legacy.
   - Adicionar `export const colors` com paleta iOS light (ver Escopo para lista completa).
   - Adicionar `export const typography` com os 11 roles (largeTitle .. caption2), cada um `{ fontSize, lineHeight, fontWeight }`.
   - **Substituir** (nao duplicar) `export const radii` com valores iOS: `{ sm: 8, md: 12, lg: 16, xl: 20, pill: 999 }`. Remover o valor antigo `md: 14` — nao ha consumidor externo de `radii` (grep confirmado).
   - **Substituir** `export const spacing` com `{ xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 }`. O legacy tinha `xl: 24`, `xxl: 32`; nenhum consumidor usa esses valores externamente.
   - **Substituir** `export const typography` inteiro — valor antigo era flat (symbolLabel, phrase, etc.); novo e estruturado com objetos.
   - Manter intactos: `palette`, `tiles`, `CHILD_GRID_COLUMNS`.
   - Adicionar `export const shadows` com 3 niveis conforme Escopo.

3. **Criacao dos primitivos**
   - Ordem sugerida (dependencias internas):
     1. `IOSButton` (sem deps de outros primitivos)
     2. `IOSCard` (sem deps)
     3. `IOSSectionHeader` (sem deps)
     4. `IOSListRow` (usa `separator` color)
     5. `IOSListSection` (pode compor `IOSSectionHeader` opcional)
     6. `IOSBottomSheet` (usa `Modal`, `SafeAreaView`)
   - Cada arquivo:
     - Imports tipados (`View`, `Text`, `Pressable`, `StyleSheet`, `ViewStyle`, `TextStyle`).
     - `import { colors, typography, radii, spacing, shadows } from '../theme';`.
     - Functional component tipado, `React.memo` quando apropriado.
     - `export default` ou `export const` (preferir named export para barrel).
     - `StyleSheet.create` com estilos derivados dos tokens.
   - `src/ui/index.ts`:
     ```ts
     export { IOSButton } from './IOSButton';
     export { IOSCard } from './IOSCard';
     export { IOSSectionHeader } from './IOSSectionHeader';
     export { IOSListSection } from './IOSListSection';
     export { IOSListRow } from './IOSListRow';
     export { IOSBottomSheet } from './IOSBottomSheet';
     ```

4. **Adocao no header (prova de conceito)**
   - Localizar o bloco de render do header em `src/App.tsx` (parte superior da tela principal, geralmente o primeiro `View` com titulo).
   - Identificar estilos hardcoded relacionados a cor, tipografia e padding do titulo/area do header.
   - Substituir valores hardcoded por tokens:
     - Cor do titulo: `colors.label`.
     - Tamanho/line-height/peso: aplicar `typography.headline` OU `typography.title2` via spread (`...typography.headline`).
     - Padding: `spacing.lg` horizontal, `spacing.md` vertical.
   - Garantir que o visual resultante seja indistinguivel (mesma cor efetiva, mesmo tamanho aproximado, mesmo peso) — o objetivo e provar que tokens funcionam, nao redesenhar (Phase 18 faz o redesign).
   - Se o valor hardcoded for substancialmente diferente do token (ex.: titulo era 22pt 700, token `title2` e 22pt 700 — match; mas se o atual for 18pt 600, podemos usar `typography.headline` que e 17pt 600). Selecionar o token mais proximo.

5. **Smoke tests**
   - `npm run lint` limpo (TypeScript strict — novos arquivos precisam estar 100% tipados).
   - `npm run test -- --runInBand`: suite completa sem novas falhas.
   - Iniciar `npm run start` ao menos uma vez para confirmar que o bundle carrega sem erros relacionados a expo-haptics/expo-blur.

6. **Fechamento**
   - Atualizar `.planning/STATE.md`: phase 17 concluida, aguardando phase 18.
   - Atualizar `.planning/ROADMAP.md` Progress Table v5 (linha Phase 17 -> 1/1, Complete, data).
   - Marcar checkbox Phase 17 em Phase Summary v5.
   - Criar `.planning/phases/17-design-system-ios/SUMMARY.md` com resumo do que foi entregue, arquivos criados/alterados, decisoes tomadas, e gotchas para Phases 18-20.

## Criterios de Aceite (UAT)
1. `src/theme.ts` exporta `colors`, `typography`, `radii`, `spacing`, `shadows` com valores iOS-aligned e docblock pt-BR no topo.
2. `src/ui/` contem 6 primitivos (IOSButton, IOSCard, IOSSectionHeader, IOSListSection, IOSListRow, IOSBottomSheet) + `index.ts` barrel, todos em TypeScript strict.
3. Header da tela principal usa tokens (`colors.label`, `typography.*`, `spacing.*`) em vez de valores hardcoded equivalentes. Visual do header permanece indistinguivel do pre-refactor.
4. `expo-haptics` e `expo-blur` estao em `package.json` (versoes alinhadas ao SDK 54) e em `app.json` `plugins`.
5. `npm run lint` sem erros novos.
6. `npm run test -- --runInBand` sem novas falhas.
7. App roda (`npm run start`) sem crash no bundler.

## Verificacao
- Validacao automatizada:
  - `npm run lint`
  - `npm run test -- --runInBand`
- Validacao manual:
  - Verificar via `grep "from '\./theme'" src/App.tsx` que o header agora consome tokens adicionais alem de `CHILD_GRID_COLUMNS`.
  - Inspecionar `src/ui/index.ts` e confirmar 6 re-exports.
  - Rodar `cat app.json | grep -E "expo-haptics|expo-blur"` -> 2 matches minimo.
  - Rodar `npm run start` localmente (nao CI) para confirmar que bundle nao quebra.

## Riscos
- `expo-haptics`/`expo-blur` podem exigir rebuild do app (nativos). Em Expo Go, ambos ja vem incluidos; em dev client ou producao, exige `npx expo prebuild` ou EAS build. Para desenvolvimento local no Expo Go, funcionam diretamente.
- Mudanca dos valores de `radii`/`spacing`/`typography` pode impactar visualmente componentes que eventualmente venham a consumi-los — por ora, nenhum consumidor externo existe alem de `CHILD_GRID_COLUMNS`.
- Ambiguidade no header sobre qual token typography usar (headline vs title2) — escolher o mais proximo visualmente; erro minor aqui nao compromete a fase (header sera redesenhado na Phase 18).

## Mitigacoes
- Manter o app rodando em Expo Go durante desenvolvimento; tratar rebuild nativo como concern futuro (se necessario, documentar no SUMMARY).
- Grep prova que exports antigos nao sao consumidos; mudanca e segura.
- Se header ficar visualmente ligeiramente diferente, documentar no SUMMARY como "token aplicado — fine-tune ocorre na Phase 18".

## Dependencias
- Depends on: nenhum (inicio da milestone v5; apos milestone v4 shipada).
- Desbloqueia: Phase 18 (Tela Principal estilo iOS), Phase 19 (Sheets/Modais — consome IOSBottomSheet), Phase 20 (Config Ajustes — consome IOSListSection/Row + haptics).
