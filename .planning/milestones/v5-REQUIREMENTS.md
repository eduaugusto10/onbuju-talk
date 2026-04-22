# REQUIREMENTS ARCHIVE - v5

**Milestone:** v5 - Refatoracao de Design no Estilo iOS
**Status:** shipped 2026-04-21
**Goal:** Refatorar a aparencia do Fala Mobile para o idioma visual iOS (iPhone), preservando a funcionalidade completa das milestones v1-v4 e a restricao dura de simplicidade para o publico autista.
**Escopo:** exclusivamente visual/UX — nenhum requisito funcional novo.

---

## v5 Requirements (16 total, all delivered ✓)

### Design System (DS)
- [x] **DS-01**: App usa paleta iOS como tokens centralizados em `src/theme.ts`.
- [x] **DS-02**: App usa escala tipografica iOS como tokens; sem `fontSize` hardcoded fora dos tokens (nos blocos principais).
- [x] **DS-03**: Raios de canto (8/12/16px), sombras sutis iOS-like, escala de espacamento 4/8/12/16/20/24 consistentes.

### Tela Principal (MAIN)
- [x] **MAIN-01**: Header estilo Navigation Bar iOS.
- [x] **MAIN-02**: Barra de categorias em Segmented Control / pills iOS.
- [x] **MAIN-03**: Campo de busca estilo iOS (background secundario, cantos arredondados, clear button).
- [x] **MAIN-04**: Cards da grade iOS (raio 14, shadow sutil, tap feedback).
- [x] **MAIN-05**: Composer com botoes em variantes iOS (Filled/Tinted/Plain).

### Sheets e Modais (SHEET)
- [x] **SHEET-01**: Modais como bottom sheets com grabber + safe-area bottom.
- [x] **SHEET-02**: Backdrop com blur/material translucido (expo-blur).
- [x] **SHEET-03**: Header com Cancelar (esquerda) + Pronto/Salvar (direita) estilo iOS.

### Config "Ajustes" (CFG)
- [x] **CFG-01**: Secoes agrupadas estilo iOS com labels UPPERCASE.
- [x] **CFG-02**: Rows com layout iOS (label esquerda, accessory direita).
- [x] **CFG-03**: Toggles binarios usam Switch nativo iOS.

### Feedback Tatil (FDB)
- [x] **FDB-01**: Haptic feedback via expo-haptics em 7 toques principais.

### Regressao (REG)
- [x] **REG-01**: Todos os fluxos das milestones v1-v4 continuam funcionando (automatizado: lint + test OK; manual em device pendente validacao em RELEASE-CHECKLIST.md).

---

## Deferred (carry forward)
- Dark mode iOS completo com semantic colors adaptativos.
- SF Symbols via expo-symbols.
- Large title com collapse animado.
- Animacoes de transicao iOS (spring via reanimated).
- Context menus (long press menu iOS).
- Swipe actions em rows.
- Cleanup de estilos legacy no StyleSheet de App.tsx.
- Migracao de hex colors remanescentes em editores secundarios para tokens.
