# Phase 20: Config Ajustes iOS + Haptic Feedback - Context

**Gathered:** 2026-04-21
**Status:** Ready for planning
**Mode:** Auto-generated

<domain>
## Phase Boundary

Reformular o conteudo interno do config modal (`src/App.tsx`) para layout iOS "Ajustes": headers de secao UPPERCASE em caixa pequena, toggles binarios como `Switch` nativo, chevrons `>` em rows navegaveis. Integrar `expo-haptics` em toques principais (adicionar simbolo, tap em frase pronta/historico, toggle passo de rotina, Ouvir/Gerar/Salvar).

</domain>

<decisions>
## Implementation Decisions

### Config layout (CFG-01, CFG-02)
- **D-01:** A pragmatic approach: manter o sistema de secoes atual (ConfigNavItem + configSection state) — nao reescrever a navegacao. Em vez disso, aplicar o visual iOS dentro de cada secao:
  - Titulos das secoes (ex.: `modalSectionTitle`) viram estilo UPPERCASE + `typography.footnote` + `colors.secondaryLabel` + letterSpacing 0.5 (padrao iOS section header).
  - Cards das secoes (`configSectionCard`) usam `colors.secondarySystemGroupedBackground` + `radii.lg` + hairline separators internos + `shadows.sm`.
- **D-02:** Rows dentro das secoes (especialmente em "Perfil"/"Acessibilidade"/"Voz") ganham padding/espacamento iOS (minHeight 44, padding horizontal 16, hairline `colors.separator` entre itens).

### Switch nativo (CFG-03)
- **D-03:** Substituir `OptionChip` binarios por `Switch` de `react-native` (nativo) em 2 lugares:
  - **Contraste:** "Padrão" / "Alto" -> um `Switch` com label "Alto contraste" (on = 'alto', off = 'padrao').
  - **Feedback visual:** "Ativado" / "Reduzido" -> `Switch` com label "Feedback visual" (on = true, off = false).
- **D-04:** `Switch` recebe `trackColor={{ false: colors.systemGray4, true: colors.systemBlue }}` e `thumbColor="#FFFFFF"` para look iOS.
- **D-05:** `OptionChip` com 3+ estados (ex.: UI Scale: compacto/padrão/confortável, Rate: 0.8/1.0/1.2) PERMANECE — sao escalas, nao binarios. CFG-03 cobre apenas os binarios.

### Chevrons (CFG-02)
- **D-06:** `ConfigNavItem` (top grid de navegacao) ja e visualmente self-evident; nao precisa chevron. As subsecoes rendem inline abaixo (nao e navegacao cross-screen), entao chevron nao se aplica funcionalmente. **Decisao pragmatica:** omitir chevrons — a UX atual e "tap na categoria, conteudo aparece abaixo", nao navegacao para outra tela. Adicionar chevrons aqui seria enganoso.
- **D-07:** ConfigNavItem em si ganha um visual mais iOS: bg `colors.secondaryFill`, active bg `colors.systemBlue` + texto branco.

### Haptics (FDB-01)
- **D-08:** Criar helper `triggerHaptic(style: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error')` em `src/services/hapticsService.ts`:
  - Usa `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light|Medium|Heavy)` para impact.
  - Usa `Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success|Warning|Error)` para notification.
  - Try/catch silencioso; no-op em ambientes sem haptics.
- **D-09:** Disparar haptics em 5 pontos-chave:
  - Tap em simbolo da grade (adicionar ao composer) — **light**.
  - Tap em frase pronta/historico — **light**.
  - Toggle passo de rotina — **success**.
  - Tap em "Gerar" (IA) — **medium** (acao primaria com latencia).
  - Tap em "Ouvir" — **light**.
  - Tap em "Salvar" (grupo/simbolo/voz) — **success**.
- **D-10:** Deletar/limpar: **warning** (feedback negativo sutil).

### Platform guard
- **D-11:** `expo-haptics` funciona em iOS e Android (API unificada). Em ambientes sem hardware haptics (web, emulador as vezes), a API retorna no-op silenciosamente. Nao precisa Platform check explicito.

### Claude's Discretion
- Ajustes de padding/margin inline nas sections iOS.
- Se o switch for visualmente pouco chamativo em alto contraste, adicionar condicional.
- Acessibilidade dos Switch: `accessibilityLabel` pt-BR em cada um.

</decisions>

<canonical_refs>
## Canonical References

- `.planning/ROADMAP.md` §"Phase 20" — deliverables.
- `.planning/REQUIREMENTS.md` §"Config Ajustes (CFG)" + §"Feedback Tatil (FDB)" — CFG-01..CFG-03, FDB-01.
- `src/App.tsx` linhas ~2663 (OptionChips de contraste/feedback), ~2069 (ConfigNavItem), linhas espalhadas (handlers de tap).
- `src/ui/` — IOSListSection/Row disponiveis para quando a reformulacao interna justificar (pragmatic approach nao os usa nesta fase).
- `expo-haptics` docs: Haptics.impactAsync, Haptics.notificationAsync.

</canonical_refs>

<code_context>
## Existing Code Insights

- `OptionChip` e um componente interno de App.tsx usado para toggles e escalas.
- `ConfigNavItem` idem — grid de navegacao top do config com icone+label.
- Config tem 9+ sections (seguranca, voz, acessibilidade, perfil, vocabulario, frases, simbolos, categorias, rotina).
- Handlers a instrumentar com haptics sao espalhados: `handleSymbolPress` / `addToComposer`, `speakPhrase`, `handleGenerate`, `handlePlay`, `saveCustomSymbol`, `toggleRoutineStep`, `clearSymbols`.
- Services ja existem em `src/services/` — `hapticsService.ts` se encaixa na convencao.

</code_context>

<specifics>
## Specific Ideas

- Preservar simplicidade acima de overhaul — nao refazer ConfigNavItem em IOSListSection se o custo for alto. Visual tweak basta.
- Haptics devem ser **sutis** — Light e o default; medium/heavy apenas em acoes de impacto (gerar IA).
- Helper `triggerHaptic` centraliza try/catch para reduzir boilerplate.

</specifics>

<deferred>
## Deferred Ideas

- Reescrita completa do config como inset grouped list puro (usando IOSListSection em cada secao) — deferido por custo vs beneficio; visual tweak atinge os criterios.
- Chevrons animados em nav items — deferido.
- Selection haptic em swipe/scroll — fora de escopo.

</deferred>

---

*Phase: 20-config-ajustes-haptics*
*Context gathered: 2026-04-21*
