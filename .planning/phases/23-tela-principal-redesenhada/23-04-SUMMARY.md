---
plan: 23-04
phase: 23
status: complete
human_verification: accepted_by_user
---

# Plano 23-04 — Compositor "Ouvir herói" + apagar em 1 toque

## Resultado
- **Task 1 — completo** (commit `2fb7994`): tocar numa figura selecionada a remove em 1 toque; link discreto "limpar" aparece só quando há figuras. Sem badge ✕ vermelho, sem caixa de lixeira (anti-padrões do skill respeitados).
- **Task 2 — completo** (commit `80ff672`): hierarquia "Ouvir herói" — botão Ouvir dominante (terracota, `flex:1.9`), Gerar (IA) menor (ouro, `flex:1`) mas rotulado e sempre visível. Card e chips migrados para tokens de tema.
- **Task 3 — aceita pelo usuário** (sinal "continue" no autônomo). A verificação visual em device fica disponível para qualquer ajuste — relatar se algo aparecer fora do esperado.

## Verificação automática
- `npm run lint` (`tsc --noEmit`): limpo.
- `npm run test`: 22/26 (4 pré-existentes; sem novas falhas).
- **VIS-02 fechado:** os 15 estilos de texto da tela principal (title, adminBadgeText, categoryButtonText, searchInput, searchButtonText, symbolLabel, emptyText, coreVocabButtonText, phraseText, emptyChipHint, selectedTextChipText, playButtonLabel, generateButtonLabel, saveGroupButtonLabel, clearLinkText) consomem `theme.typography.*` (que carrega Nunito). `grep "fontFamily: '" src/App.tsx` retorna 0.

## Conclui (Phase 23 inteira — 4 planos)
- TELA-01 (layout enxuto) — concluído.
- TELA-02 (card com cor de categoria) — concluído.
- TELA-03 (compositor Ouvir-herói) — concluído.
- TELA-04 (apagar em 1 toque + limpar contextual) — concluído.
- VIS-02 (Nunito aplicada) — fechado em 23, encerrando o gap da fase 22.
