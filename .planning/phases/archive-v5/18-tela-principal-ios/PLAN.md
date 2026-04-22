# PLAN - Phase 18 - Tela Principal estilo iOS

## Objetivo
Refatorar a tela principal (`src/App.tsx`) para a estetica iOS usando tokens e primitivos da Phase 17. Header nav-bar iOS, categorias em segmented/pills, search field iOS, SymbolCard refatorado, core vocab bar tinted, composer com IOSButton. Escopo visual apenas — nenhum fluxo funcional muda.

## Requisitos Mapeados
- MAIN-01: header nav-bar iOS.
- MAIN-02: categorias em segmented/pills iOS.
- MAIN-03: search field iOS.
- MAIN-04: SymbolCard iOS + favorite overlay.
- MAIN-05: composer com botoes iOS.

## Escopo

### Header
- Trocar `headerCard` de borderWidth/borderColor para estilo nav-bar: sem borda, bg `systemBackground`, adicionar hairline `borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.separator`.
- Titulo ja usa `typography.title2` + `colors.label` (feito na Phase 17). Aumentar pequenos detalhes: tagline centraliza ou alinha para caber no padrao iOS.
- Admin badge vira pill com `radii.pill`, padding horizontal 10 vertical 3, bg `fill`, texto `caption1` em `systemBlue`.
- Botoes de acao do header: refatorar de botoes custom para estilo plain iOS (texto `systemBlue`, sem bg; hit slop 8; touch target 44).

### Categorias
- Localizar estilo `categoryPill` / `categoryPillActive` (ou equivalente).
- Ativa: bg `colors.systemBlue`, texto `#FFFFFF`, peso 600.
- Inativa: bg `colors.secondaryFill`, texto `colors.label`, peso 500.
- Padding horizontal 14, vertical 7, `radii.pill`, minHeight 32.
- Separador entre pills (gap) 8.
- Preservar scroll horizontal e comportamento de selecao.

### Search field
- Container: bg `colors.systemGray6`, `borderRadius: 10`, padding horizontal 10 vertical 8, flexDirection row, alignItems center.
- Icone lupa (emoji 🔍 ou texto) a esquerda com margin right 6.
- TextInput centralizado sem border, cor texto `colors.label`, placeholder cor `colors.tertiaryLabel`.
- Botao clear (✕ em circulo) a direita quando texto presente: View 18x18 com bg `colors.systemGray`, borderRadius 9, centraliza texto ✕ branco.
- Placeholder pt-BR: "Buscar simbolos" (usar o atual se ja for).

### SymbolCard
- Container: `borderRadius: 14`, `...shadows.sm`, `backgroundColor: colors.systemBackground`.
- Pressable com `({ pressed }) => [style, pressed && { opacity: 0.7 }]`.
- Favorite overlay: posicionar com `position: absolute`, `top: 6`, `right: 6`, View circular 32x32 com bg `colors.systemBackground`, `shadows.sm`, borderRadius 16, centraliza icone estrela (emoji ⭐ ou estrela amarela dourada).
- Border legacy (se existir) removida.

### Core vocab bar chips
- Cada chip: bg `colors.secondaryFill` (ou `fill` para destaque), borderRadius `radii.md`, padding horizontal 12 vertical 6, texto `colors.label` peso 500, fontSize 15.
- Preservar comportamento de tap (adiciona palavra ao composer).

### Composer
- Card: bg `colors.secondarySystemGroupedBackground`, `borderRadius: radii.lg`, `padding: spacing.lg`, `...shadows.sm`. Remover borderWidth/borderColor se existir.
- Substituir botoes custom existentes por `<IOSButton>` do `src/ui`:
  - "Gerar" (IA) -> `variant="filled"`.
  - "Ouvir" -> `variant="filled"`.
  - "Limpar" -> `variant="plain"` + `destructive`.
  - "Salvar" (grupo) -> `variant="tinted"`.
  - Manter labels em pt-BR existentes.
- Icon aliases (se botoes usavam icones emoji, passar como `icon` prop do IOSButton).
- Preservar handlers (`onPress` passa para IOSButton).

### Alto contraste
- Revisar cada bloco refatorado e garantir que quando `isHighContrast` ativo, bg escuro e texto claro continuam. Onde necessario, manter condicional `isHighContrast && styles.xxxHighContrast`.

### Nao altera
- Nenhuma logica de state / handlers.
- Nenhum fluxo de dados (ARASAAC, favorites, speech, AI, routine, etc.).
- Estrutura de componentes (nao extrair componentes novos aqui — so substituir estilos/wrappers).

## Fora de Escopo
- Refatoracao do config modal (Phase 20).
- Refatoracao de qualquer modal/sheet (Phase 19).
- Rotina e symbol draft modals (Phase 19).
- Introducao de `IOSChip` primitivo (deferido).
- SF Symbols (deferido).
- Spring animations (deferido).
- Remocao dos styles legacy (Phase 21).

## Arquivos Alvo
- `src/App.tsx` (unico arquivo alterado)

## Plano de Implementacao

1. **Localizar blocos de estilo no StyleSheet final de App.tsx**:
   - headerCard, title, headerTagline, headerActions
   - categoryButton, categoryButtonActive (ou nomes equivalentes)
   - searchInput / searchWrapper
   - symbolCard, symbolLabel, favoriteStarButton
   - coreChip / coreVocabButton
   - composerCard, composerActions, generateButton, speakButton, clearButton, saveButton

2. **Refatorar header styles** (substituir valores hardcoded por tokens, adicionar hairline bottom).

3. **Refatorar categorias**: ativa/inativa com cores iOS corretas; padding e radius iOS.

4. **Refatorar search**: envolver TextInput em container com bg systemGray6, adicionar icones lupa e clear.

5. **Refatorar SymbolCard**: radius 14, shadows.sm, opacity feedback, favorite overlay circular.

6. **Refatorar core vocab chips**: cores iOS tinted.

7. **Refatorar composer**:
   - Card container com bg/radius/shadow corretos.
   - Importar `IOSButton` do `../ui`.
   - Substituir blocos `<Pressable>...<Text>Gerar</Text></Pressable>` (e similares) por `<IOSButton label="Gerar" variant="filled" onPress={handleGenerate} />`.
   - Repetir para Ouvir, Limpar, Salvar.

8. **Alto contraste**: revisar overrides e garantir que continuam coerentes visualmente com os novos estilos base.

9. **Smoke**:
   - `npm run lint` limpo.
   - `npm run test -- --runInBand` sem novos failures.
   - `npm run start` — abrir app e validar visualmente header/categorias/busca/grid/composer.

10. **Fechamento**:
    - Atualizar STATE.md (phase 18 complete).
    - Atualizar ROADMAP Progress Table v5 (linha 18 -> 1/1 Complete).
    - Marcar checkbox Phase 18.
    - Criar `.planning/phases/18-tela-principal-ios/SUMMARY.md`.

## Criterios de Aceite (UAT)
1. Header usa hairline separator e tokens iOS; titulo e tagline estilizados coerentes.
2. Categorias ativa/inativa claramente diferenciadas com `systemBlue` vs `secondaryFill`.
3. Search field em estilo iOS com icone lupa e botao clear funcional.
4. SymbolCard tem cantos arredondados 14px, shadow sutil, tap opacity, estrela circular.
5. Composer usa `IOSButton` filled/tinted/plain com labels pt-BR intactos.
6. Alto contraste continua funcionando em todos os blocos refatorados.
7. Nenhum fluxo funcional quebra: selecionar simbolo, gerar frase, ouvir, limpar, salvar.
8. `npm run lint` limpo; `npm run test` sem novos failures.

## Verificacao
- Automatizada:
  - `npm run lint`
  - `npm run test -- --runInBand`
- Manual (smoke):
  - `npm run start` + visualizar cada bloco em iOS simulator ou Expo Go.
  - Selecionar simbolo -> composer mostra.
  - Gerar frase -> IA normaliza (requer key).
  - Ouvir -> TTS fala.
  - Limpar -> composer zera.
  - Salvar -> prompt de grupo aparece.
  - Alternar modo alto contraste -> visual continua legivel.

## Riscos
- `App.tsx` e grande; mudancas de estilo podem acidentalmente afetar blocos vizinhos.
- `IOSButton` tem defaults que podem diferir dos estilos atuais (tamanho, padding); pode exigir overrides via `style` prop.
- Favorite star overlay pode se sobrepor a imagem do simbolo; ajustar z-index se necessario.

## Mitigacoes
- Fazer mudancas em blocos isolados (um por um) e validar lint apos cada um.
- Usar `IOSButton` com `size="md"` (default) e sobrescrever via prop `style` quando necessario.
- Testar favorite overlay com simbolos grandes e pequenos; ajustar `right`/`top` se necessario.

## Dependencias
- Depends on: Phase 17 (tokens e `IOSButton`).
- Desbloqueia: Phase 21 (regressao final).
