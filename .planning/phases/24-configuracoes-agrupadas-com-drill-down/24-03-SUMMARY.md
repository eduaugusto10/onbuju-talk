---
plan: 24-03
phase: 24
status: complete
requirements: [CFG-01, CFG-02]
tags: [config, drill-down, conteudo-crianca, vocabulario, frases, simbolos, categorias, rotina, cenas, salvia-creme]
files_modified:
  - src/App.tsx
commits:
  - 60f7150
  - 6e64bf7
  - a60ab79
metrics:
  duration_minutes: 15
  tasks_completed: 3
  files_changed: 1
  completed: 2026-05-20
---

# Plano 24-03 — Grupo "Conteúdo da crianca" restilizado no drill-down

As 6 sub-telas do grupo "Conteúdo da criança" (Vocabulário core, Frases prontas, Símbolos pessoais, Categorias, Rotina do dia, Cenas visuais) passam do JSX legado denso (rótulo + 3 botõezinhos espremidos) para o padrão drill-down Salvia & Creme — cards titulados em UPPERCASE muted, linhas de item respiráveis com chips 32x32 arredondados, edição inline em `drillInlineInput`, e gating defensivo `!isAdmin -> drillEmptyHint`. Toda a lógica dos editores preservada verbatim.

## Resultado

- **Task 1** (commit `60f7150`): 11 novos style keys em `makeStyles(theme)` — `drillItemRow`, `drillItemRowDivider`, `drillItemLabel`, `drillItemSubLabel`, `drillIconButton`, `drillIconButtonDanger`, `drillIconButtonText`, `drillIconButtonTextDanger`, `drillInlineInput`, `drillAddRow`, `drillEmptyHint`, `drillListCard`. Sub-tela `'vocabulario'` reescrita: `PALAVRAS ATUAIS` (drillListCard com drillItemRow + chips ↑/↓/✕) + `ADICIONAR` (drillSectionCard com drillInlineInput + drillPrimaryButton) + Restaurar padrão (drillSecondaryButton). Sub-tela `'frases'` reescrita: `FRASES SALVAS` (drillListCard com modo edição inline drillInlineInput + chips OK/✕ ou ✎/✕) + `ADICIONAR` + `HISTÓRICO` (drillSecondaryButton). Estado `newPhraseInput` reusado verbatim (1 declaração, linha 391) — NÃO duplicado.
- **Task 2** (commit `6e64bf7`): Sub-tela `'simbolos'` reescrita: `FONTES` (drillSectionCard com 2 drillPrimaryButton flex:1 Câmera/Galeria, AMBOS com `disabled={pickerBusy}` + `pickerBusy && { opacity: 0.6 }`) + draft `symbolDraftCard` envolvido em drillSectionCard mantendo internals (categoryRow/Chip preservados) + `GALERIA DE SÍMBOLOS PESSOAIS` (drillListCard com drillItemRow contendo thumb + drillItemLabel/SubLabel + EXATAMENTE os 3 handlers reais: 🎙 openAudioRecorderFor sempre / 🔇 clearSymbolAudio quando `hasAudio === true` / ✕ removePersonalSymbol danger). Sub-tela `'categorias'` reescrita: `CATEGORIAS ATUAIS` (drillListCard com drillItemRow + drillItemLabel/SubLabel "{N} símbolo(s)" + modo edição inline + chips ✎/✕) + `ADICIONAR` (drillSectionCard) + hint pt-BR.
- **Task 3** (commit `a60ab79`): Sub-telas `'rotina'` e `'cenas'` recebem apenas o invólucro drill-down — `!isAdmin -> drillEmptyHint`, senão header UPPERCASE (`PASSOS DO DIA` / `CENAS`) + wrapper `drillSectionCard` com hint pt-BR em `drillFieldHint` envolvendo todo o JSX legado dos editores. Internals (`routinePickerSourceButton`, `routineDayChip`, `routineDraftCard`, `sceneListRow`, etc.) preservados VERBATIM conforme o escopo Deferred Ideas em `24-CONTEXT.md`. `SceneEditor` e `SceneViewer` (renderizados fora do sheet em linhas 3737/3745) intactos.

## Decisões

- **`drillListCard` separado de `drillSectionCard`.** Listas (vocabulário, frases salvas, galeria de símbolos, categorias) precisam de `overflow: 'hidden'` para que os hairlines do `drillItemRowDivider` respeitem o `borderRadius.lg` do card. `drillSectionCard` não tem `overflow: 'hidden'` porque ele hospeda inputs/chips/buttons que respiram fora do card via `gap`.
- **Botões Câmera/Galeria em flex:1 lado a lado** (em vez do antigo `personalSymbolAddButton`/`personalSymbolAddButtonBusy`). O contrato crítico `disabled={pickerBusy}` + `pickerBusy && { opacity: 0.6 }` é preservado nos DOIS Pressables — confirma o bloqueio de duplo-toque durante a captura.
- **Draft de símbolo (`pendingSymbolImage`) preserva categoryRow/Chip legados** dentro do novo `drillSectionCard`. O draft é uma micro-tela transiente; redesenhar seus chips de categoria estaria fora do escopo do plano (3 handlers reais são apenas para a galeria de símbolos salvos).
- **Modo edição inline para frases e categorias** substitui `phraseEditorInput` por `drillInlineInput` (input tokenizado) + chips `drillIconButton` "OK" e `✕` (danger). Acabou o sufixo `phraseEditorButtonPrimary` — o chip neutro com texto "OK" comunica confirmação suficientemente, e o danger fica para cancelar/remover.
- **Galeria de símbolos pessoais SEM botão "editar (lápis)"** — handler `editPersonalSymbol` não existe no código. O caregiver renomeia um símbolo apagando-o (✕) e recriando. EXATAMENTE 3 ações reais por linha: 🎙 openAudioRecorderFor (sempre) / 🔇 clearSymbolAudio (condicional `hasAudio`) / ✕ removePersonalSymbol (sempre, danger).
- **Estado `newPhraseInput` reusado VERBATIM** (linha 391, não 387 como o plano referenciava — diferença de offset apenas, declaração única confirmada por `grep -c "const \[newPhraseInput" src/App.tsx` retornar 1). Zero duplicação.
- **Wrappers de Rotina/Cenas em `drillSectionCard`, internals legados intactos.** Plano 24-03 não inclui o redesenho dos editores de rotina e cenas (Deferred Ideas — fase 25 ou Future). Apenas a casca externa muda; chips de dias, draft de passo, sceneListRow etc. ficam para futuras passagens. Hint principal de cada sub-tela migrada para `drillFieldHint` (tokenizado).
- **`isHighContrast` removido dos JSXs restilizados.** Tema Sereno Escuro cobre o caso noturno via `theme.colors.*`. O `symbolDraftCard` legado (que mantemos verbatim no draft) preserva `isHighContrast` no array de style — escopo de futura limpeza.

## Verificação automática

- `npm run lint` (`tsc --noEmit`): limpo.
- `npm run test --runInBand`: 22/26 (4 falhas pré-existentes em `arasaacService.test.ts` herdadas, sem novas falhas — exatamente o baseline do plano 24-02).
- `grep "fontFamily: '" src/App.tsx` retorna 0 (VIS-02 segue fechado).
- `grep -c "const \[newPhraseInput" src/App.tsx` retorna 1 (estado único, não duplicado).
- `grep -cE "drillItemRow:|drillItemRowDivider:|drillItemLabel:|drillIconButton:|drillIconButtonDanger:|drillInlineInput:|drillEmptyHint:|drillListCard:" src/App.tsx` retorna 8 (todos os tokens novos presentes).
- `grep -n "configRoute === '(vocabulario|frases|simbolos|categorias|rotina|cenas)'" src/App.tsx` retorna 6 ocorrências (uma por sub-tela).
- `SceneEditor` e `SceneViewer` continuam renderizados nas linhas 3737/3745 (fora do sheet).
- Handlers preservados verbatim: `addCoreVocabularyWord`, `moveCoreVocabularyWord`, `removeCoreVocabularyWord`, `resetCoreVocabulary`, `addSavedPhrase`, `removeSavedPhrase`, `startEditingPhrase`, `commitEditingPhrase`, `cancelEditingPhrase`, `clearPhraseHistory`, `pickFromCamera`, `pickFromGallery`, `savePendingSymbol`, `cancelPendingSymbol`, `openAudioRecorderFor`, `clearSymbolAudio`, `removePersonalSymbol`, `addCustomCategory`, `removeCustomCategory`, `startEditCategory`, `commitEditCategory`, `cancelEditCategory`, e todos os handlers internos de rotina/cenas.

## Desvios do plano

Nenhum. Plano executado conforme escrito. Observação: a linha de declaração do `newPhraseInput` é 391 e não 387 como o plano referenciava — verificação adaptativa (grep) confirma declaração única e reuso correto. Diferença puramente de offset; sem impacto funcional.

## Self-Check: PASSED

- FOUND: `.planning/phases/24-configuracoes-agrupadas-com-drill-down/24-03-SUMMARY.md`
- FOUND: commit `60f7150` (Task 1 — tokens drillItem* + Vocabulario + Frases)
- FOUND: commit `6e64bf7` (Task 2 — Simbolos + Categorias)
- FOUND: commit `a60ab79` (Task 3 — Rotina + Cenas envolvidos)

## Próximos planos

- 24-04 (grupo Cuidador: Senha 3 estados + Chave IA + Sair)
