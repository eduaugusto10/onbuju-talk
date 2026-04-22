# Phase 18: Tela Principal estilo iOS - Context

**Gathered:** 2026-04-21
**Status:** Ready for planning
**Mode:** Auto-generated (ROADMAP e spec)

<domain>
## Phase Boundary

Refatorar toda a tela principal (`src/App.tsx`) para o idioma visual iOS usando os tokens e primitivos criados na Phase 17. Escopo: header nav-bar, barra de categorias (segmented/pills), search field, grid de simbolos (SymbolCard), core vocab bar, composer card. Escopo exclusivamente visual — nenhum fluxo funcional muda.

</domain>

<decisions>
## Implementation Decisions

### Header (MAIN-01)
- **D-01:** Header mantem layout atual (linha com avatar/titulo/acoes) mas adota estetica nav-bar iOS: titulo centralizado com `typography.headline`/`title3`, acoes compactas a direita (botoes plain com `systemBlue`), admin badge com `radii.pill` e bg `colors.fill`.
- **D-02:** Border/shadow do headerCard trocam para estilo iOS: sem borda visivel, background `systemBackground`, separator sutil (hairlineWidth em `separator`) na base ao inves de border.

### Categorias (MAIN-02)
- **D-03:** Barra horizontal de pills iOS. Selecionada: bg `systemBlue`, texto branco, peso 600. Nao-selecionada: bg `secondaryFill`, texto `label`, peso 500. Padding horizontal 14, vertical 7, `radii.pill`.
- **D-04:** Preserva comportamento atual (scroll horizontal, categorias dinamicas Favoritos/Frases/Historico/Rotina/Custom/ARASAAC). Sem refactor de logica.

### Search field (MAIN-03)
- **D-05:** TextInput wrapper com bg `systemGray6`, `radii` 10px (valor literal; nao e token — iOS search usa 10 especifico), icone lupa emoji/texto a esquerda, botao clear (`✕` em circulo `systemGray`) a direita quando ha texto. Placeholder em pt-BR.
- **D-06:** Manter logica de busca debounced existente intacta.

### SymbolCard (MAIN-04)
- **D-07:** `radii` 14 (literal; mais proximo do que os tokens oferecem sem usar `md: 12`), `shadows.sm`, tap feedback `Pressable` com opacity 0.7, favorite star como overlay circular (32px, bg `systemBackground` com shadow, icone estrela dourada) no canto superior direito.
- **D-08:** Image e label mantem contrato atual; apenas o container card muda.

### Core vocab bar (MAIN-04 relacionado)
- **D-09:** Chips tinted iOS: bg `fill` ou `secondaryFill`, texto `label`, peso 500, `radii.md`. Preserva logica e dados.

### Composer (MAIN-05)
- **D-10:** Card composer adota bg `secondarySystemGroupedBackground`, `radii.lg`, `shadows.sm`. Botoes:
  - "Gerar" (IA) -> `IOSButton variant="filled"` (systemBlue).
  - "Ouvir" -> `IOSButton variant="filled"`.
  - "Limpar"/"Deletar" -> `IOSButton variant="plain" destructive`.
  - "Salvar" -> `IOSButton variant="tinted"`.
- **D-11:** Preservar todos os handlers existentes (`handleGenerate`, `handleSpeak`, `handleClear`, `handleSaveGroup`, etc.). Somente trocar estilos/wrappers.

### Alto contraste
- **D-12:** Manter bifurcacao atual via `contrastMode === 'alto'`. Quando alto contraste estiver ativo, overrides sobrescrevem colors dos tokens (bg escuro, texto claro). Nenhuma mudanca de logica.

### Claude's Discretion
- Pequenos ajustes de spacing/margin entre blocos para polimento visual iOS.
- Nomear StyleSheet keys novos com prefixo `ios` (ex.: `iosCategoryPill`) para distinguir dos legacy que virao a ser removidos na Phase 21.
- Uso de emojis vs texto simples para icones (lupa, clear, estrela) — manter emojis para simplicidade (SF Symbols fora de escopo).

</decisions>

<canonical_refs>
## Canonical References

- `.planning/ROADMAP.md` §"Phase 18" — deliverables e success criteria.
- `.planning/REQUIREMENTS.md` §"Tela Principal (MAIN)" — MAIN-01..MAIN-05.
- `.planning/phases/17-design-system-ios/17-UI-SPEC.md` — design tokens autoritativos.
- `.planning/phases/17-design-system-ios/SUMMARY.md` — gotchas dos tokens e primitivos.
- `src/theme.ts` — tokens disponiveis (colors, typography, radii, spacing, shadows).
- `src/ui/index.ts` — primitivos disponiveis (IOSButton, IOSCard, IOSListRow, IOSListSection, IOSSectionHeader, IOSBottomSheet).
- `src/App.tsx` — monolito com toda a UI da tela principal.

</canonical_refs>

<code_context>
## Existing Code Insights

- `App.tsx` e grande (~3700 linhas). Toda a UI esta inline; StyleSheet ao final.
- Header, categorias, search, grid, core vocab, composer sao todos blocos separados no render.
- `contrastMode` e aplicado via condicionais (`isHighContrast && styles.xxxHighContrast`).
- `uiScaleFactor` multiplica fontSize de textos principais (acessibilidade de escala).
- Categorias sao renderizadas via `CategoryButton` component/inline. Search via TextInput custom.
- Phase 17 deixou `IOSButton` importavel — ja e uma opcao para os botoes do composer.

</code_context>

<specifics>
## Specific Ideas

- Nao introduzir novos primitivos — usar os 6 ja criados em Phase 17. Estilos especificos da tela principal sao inline em `App.tsx`.
- `IOSButton` e perfeito para o composer. Para categorias (pills) e vocab chips, estilos inline sao mais leves que criar um `IOSChip` (adiado).
- Search field fica inline (Phase 20 nao precisa refatorar config search do mesmo jeito).

</specifics>

<deferred>
## Deferred Ideas

- `IOSChip` como primitivo reutilizavel — nao vale o boilerplate nesta fase (inline style serve). Possivel em milestone futura.
- Animacao de transicao entre categorias (fade/slide) — fora de escopo.
- Long press em SymbolCard para context menu — deferido (REQUIREMENTS.md ja registra).
- Remocao dos styles legacy no final do StyleSheet — fica para Phase 21.

</deferred>

---

*Phase: 18-tela-principal-ios*
*Context gathered: 2026-04-21*
