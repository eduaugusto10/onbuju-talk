# Phase 19: Sheets e Modais iOS - Context

**Gathered:** 2026-04-21
**Status:** Ready for planning
**Mode:** Auto-generated (ROADMAP e spec)

<domain>
## Phase Boundary

Substituir `Modal` tradicionais por bottom sheets estilo iOS com grabber visivel e backdrop desfocado (BlurView via `expo-blur`). Aplicar em: naming group modal, audio recorder modal, symbol draft modal, config modal (shell apenas — conteudo interno do config e Phase 20). Header com "Cancelar" esquerda / "Pronto"/"Salvar" direita.

</domain>

<decisions>
## Implementation Decisions

### IOSBottomSheet upgrade
- **D-01:** Trocar backdrop semi-transparente por `BlurView` de `expo-blur` com `intensity={70}` + overlay `rgba(0,0,0,0.15)` por cima. Fallback: se BlurView nao montar, ainda ha overlay visivel.
- **D-02:** Preservar grabber 36x5, safe-area inset, `max-height 85%`, cantos superiores `radii.xl`.

### Sheets a refatorar (SHEET-01, SHEET-02, SHEET-03)
- **D-03:** **Naming group modal** (salvar grupo) — vira `IOSBottomSheet` com title "Salvar grupo", leftAction "Cancelar", rightAction "Salvar" bold (`systemBlue`). Conteudo: TextInput.
- **D-04:** **Audio recorder modal** (gravar voz do cuidador) — vira `IOSBottomSheet` com title "Gravar voz", leftAction "Cancelar", rightAction "Salvar" (disabled sem gravacao). Conteudo: AudioRecorderControls.
- **D-05:** **Symbol draft modal** (novo simbolo pessoal) — vira `IOSBottomSheet` com title "Novo simbolo", leftAction "Cancelar", rightAction "Salvar". Conteudo: preview + label input + audio controls + category chips.
- **D-06:** **Config modal shell** — vira `IOSBottomSheet` com title "Ajustes", leftAction "Fechar" (fecha + reset), rightAction undefined (config nao tem acao primaria singular). **Conteudo interno permanece inalterado nesta fase** (Phase 20 reformula com inset grouped list).

### Actions convention
- **D-07:** Para sheets com acao primaria (salvar/pronto), rightAction usa `bold: true`. Para sheets apenas informativos/config, nao ha rightAction.
- **D-08:** leftAction destructive=false (cinza ou `systemBlue`). Label "Cancelar" padrao; config usa "Fechar".

### Claude's Discretion
- Pequenos ajustes de padding/spacing dentro dos sheets para respiro iOS.
- Remover estilos `modalBackdrop`/`modalCard`/`modalCardHighContrast`/`symbolDraftCard` obsoletos apos migracao (cleanup inline).
- Nomes dos wrapper components nao precisam mudar (`isNamingModalOpen`, `audioSymbolId`, etc. ficam).

</decisions>

<canonical_refs>
## Canonical References

- `.planning/ROADMAP.md` §"Phase 19 - Sheets e Modais iOS" — deliverables.
- `.planning/REQUIREMENTS.md` §"Sheets e Modais (SHEET)" — SHEET-01..SHEET-03.
- `.planning/phases/17-design-system-ios/SUMMARY.md` — detalhe do `IOSBottomSheet`.
- `src/ui/IOSBottomSheet.tsx` — primitivo a atualizar com BlurView.
- `src/App.tsx` linhas 1930-2058 — 3 modais simples; linhas 2060+ — config modal shell.

</canonical_refs>

<code_context>
## Existing Code Insights

- 4 `Modal` tradicionais em App.tsx: naming group (1930), audio recorder (1953), symbol draft (1988), config (2060).
- Estilos `modalBackdrop`, `modalCard`, `modalActions`, `modalButtonLight`, `modalButtonPrimary`, `modalButtonPrimaryText`, `modalInput`, `modalTitle`, `modalHint`, `symbolDraftCard`, `symbolDraftPreview` — todos ficam obsoletos apos migracao (Phase 21 cleanup).
- `IOSBottomSheet` ja aceita `leftAction`/`rightAction` com `disabled`/`destructive`/`bold` — suficiente para os 4 casos.
- `BlurView` de `expo-blur`: `import { BlurView } from 'expo-blur'`. Props: `intensity`, `tint` ('light'|'dark'|'default'), `style`.

</code_context>

<specifics>
## Specific Ideas

- Config modal shell troca do Modal tradicional para IOSBottomSheet com maxHeight 85% — conteudo interno (campos, sections) nao muda nesta fase.
- BlurView com `tint="default"` (adapta ao userInterfaceStyle do app).
- `expo-blur` requer ambient environment para melhor efeito em iOS; em Android, fallback automatico para overlay solido. Nao e problema para nos.

</specifics>

<deferred>
## Deferred Ideas

- Reformulacao interna do config como inset grouped list + switches + haptics — Phase 20.
- Animacoes spring de abertura (reanimated) — deferido.
- Detents (multi-height sheets) — deferido; `max-height 85%` fixo.
- Swipe down gesture para dismiss — Modal nativo ja suporta via `onRequestClose`; nao precisa gesture adicional.

</deferred>

---

*Phase: 19-sheets-modais-ios*
*Context gathered: 2026-04-21*
