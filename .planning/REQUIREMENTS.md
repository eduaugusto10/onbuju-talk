# REQUIREMENTS - Milestone v5

**Milestone:** v5 - Refatoracao de Design no Estilo iOS
**Goal:** Refatorar a aparencia do Fala Mobile para o idioma visual do iOS (iPhone), preservando a funcionalidade completa entregue nas milestones v1-v4 e a restricao dura de simplicidade para o publico autista.
**Publico-alvo:** criancas autistas; restricao dura de simplicidade sobre riqueza de features.
**Escopo:** exclusivamente visual/UX — nenhum requisito funcional novo.

---

## v5 Requirements

### Design System (DS)

- [ ] **DS-01**: App usa paleta de cores iOS (system blue `#007AFF`, system grays, grouped backgrounds) como tokens centralizados em `src/theme.ts`.
- [ ] **DS-02**: App usa escala tipografica iOS (largeTitle 34pt, title1 28pt, title2 22pt, body 17pt, footnote 13pt, caption 11pt) como tokens; nenhum `fontSize` hardcoded fora dos tokens.
- [ ] **DS-03**: App usa raios de canto (8/12/16px), sombras sutis iOS-like e escala de espacamento 4/8/12/16/20/24 consistentes em todos os componentes.

### Tela Principal (MAIN)

- [ ] **MAIN-01**: Header exibe titulo em estilo Navigation Bar iOS (titulo grande ou centralizado conforme padrao iOS), com acoes alinhadas a direita.
- [ ] **MAIN-02**: Barra de categorias usa estilo Segmented Control / pills iOS com selecionado em destaque e nao-selecionado em tom neutro.
- [ ] **MAIN-03**: Campo de busca (quando visivel) usa estilo iOS search field — background secundario, cantos arredondados, placeholder pt-BR e icone de lupa.
- [ ] **MAIN-04**: Cards da grade de simbolos seguem estilo iOS — raio 12-16px, sombra sutil, tap feedback (opacidade ou escala leve).
- [ ] **MAIN-05**: Composer (selecao + frase + acoes) usa botoes em variantes iOS (Filled/Tinted/Plain), com icones e espacamento caracteristico.

### Sheets e Modais (SHEET)

- [ ] **SHEET-01**: Modais principais (config, draft de simbolo, gravacao de voz, naming de grupo, regravar voz) abrem como bottom sheets com grabber visivel e ancorados no safe-area bottom.
- [ ] **SHEET-02**: Backdrop dos sheets usa blur / material translucido (via `expo-blur`) em vez de overlay solido.
- [ ] **SHEET-03**: Sheets possuem header com "Cancelar" a esquerda e "Pronto"/"Salvar" a direita, estilo iOS.

### Config "Ajustes" (CFG)

- [ ] **CFG-01**: Config apresenta secoes agrupadas estilo iOS (inset grouped list), com labels de secao em caixa pequena (UPPERCASE ou small-caps) acima de cada grupo.
- [ ] **CFG-02**: Rows de config usam layout de linha iOS — texto/label a esquerda, valor ou accessory a direita, chevron `>` quando navegavel.
- [ ] **CFG-03**: Toggles binarios (feedback visual, contraste, ...) usam componente `Switch` nativo estilo iOS em vez de `OptionChip`.

### Feedback Tatil (FDB)

- [ ] **FDB-01**: App aciona haptic feedback via `expo-haptics` em toques principais (falar frase, marcar passo de rotina, adicionar simbolo ao composer, salvar).

### Regressao (REG)

- [ ] **REG-01**: Todos os fluxos das milestones v1-v4 continuam funcionando sem regressao apos a refatoracao visual (composer, gerar IA, voz TTS, favoritos, vocabulario core, frases prontas, historico, simbolos pessoais via camera/galeria, voz gravada, rotina visual, categorias customizadas, admin).

---

## Future Requirements (Deferred)

Features avaliadas para v5 mas adiadas para milestones futuras:

- **Dark mode iOS completo** — o modo high-contrast atual ja cobre parte do caso; migrar para semantic colors iOS (system*) em milestone futura.
- **SF Symbols via expo-symbols** — usar glifos iOS nativos em vez de emojis; exige native module adicional.
- **Large title com collapse animado** — `Header` animado que encolhe ao rolar. Complexidade alta para beneficio incremental.
- **Animacoes de transicao iOS (spring)** — `react-native-reanimated` com springs padrao iOS.
- **Context menus (long press menu iOS)** — menu de acoes estilo iOS ao long-press em simbolos/frases.
- **Swipe actions em rows** — gesto de deslizar para revelar acoes (editar/remover).

## Out of Scope

Features explicitamente fora do escopo com justificativa:

- **Reescrita de funcionalidade** — v5 e visual apenas; nenhum comportamento muda.
- **Redesign do splash/intro screen** — intro da v3 ja e recente e esta funcionando bem; foco da v5 e a tela principal.
- **Redesign para Android Material** — app e mobile cross-plataforma, mas a diretriz do usuario e iPhone. Android recebe o mesmo visual iOS-style (consistencia single-design).
- **Navegacao multi-screen (React Navigation)** — app permanece single-screen.
- **Novos fluxos ou features funcionais** — fora do escopo desta milestone.

---

## Traceability

| REQ-ID  | Category                     | Phase    | Notes                                         |
|---------|------------------------------|----------|-----------------------------------------------|
| DS-01   | Design System                | Phase 17 | Tokens de cor em theme.ts                     |
| DS-02   | Design System                | Phase 17 | Tokens de tipografia                          |
| DS-03   | Design System                | Phase 17 | Raios, sombras, espacamento                   |
| MAIN-01 | Tela Principal               | Phase 18 | Nav bar iOS                                   |
| MAIN-02 | Tela Principal               | Phase 18 | Segmented control / pills                     |
| MAIN-03 | Tela Principal               | Phase 18 | Search field iOS                              |
| MAIN-04 | Tela Principal               | Phase 18 | Cards iOS                                     |
| MAIN-05 | Tela Principal               | Phase 18 | Composer iOS                                  |
| SHEET-01| Sheets e Modais              | Phase 19 | Bottom sheet com grabber                      |
| SHEET-02| Sheets e Modais              | Phase 19 | Blur backdrop                                 |
| SHEET-03| Sheets e Modais              | Phase 19 | Header Cancelar/Pronto                        |
| CFG-01  | Config Ajustes               | Phase 20 | Inset grouped list                            |
| CFG-02  | Config Ajustes               | Phase 20 | List rows com chevron                         |
| CFG-03  | Config Ajustes               | Phase 20 | Switch iOS                                    |
| FDB-01  | Feedback Tatil               | Phase 20 | Haptic feedback                               |
| REG-01  | Regressao                    | Phase 21 | Regressao de todos os fluxos anteriores       |

---

**Total:** 16 requirements | **Categorias:** 6 | **Status:** roadmap criado, aguardando planejamento da Phase 17
