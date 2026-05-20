# REQUIREMENTS - Milestone v6

**Milestone:** v6 - Redesign Visual Calmo
**Goal:** Aplicar ao app real a direcao de design validada nos 4 sketches — paleta calma "Salvia & Creme", layout enxuto, novos cards, compositor reorganizado e configuracoes em drill-down — substituindo a estetica iOS azul da v5.
**Publico-alvo:** criancas autistas; restricao dura de simplicidade sobre riqueza de features.
**Escopo:** visual/UX — nenhum requisito funcional novo. Toda a funcionalidade v1-v4 e preservada.
**Fonte de design:** decisoes empacotadas no skill `sketch-findings-fala`; sketches em `.planning/sketches/`.

---

## v6 Requirements

### Sistema Visual (VIS)

- [x] **VIS-01**: App usa a paleta "Salvia & Creme" como tokens centralizados em `src/theme.ts` — salvia (ativo/selecionado), ouro (acao Gerar IA), terracota (acao Ouvir), creme (fundo e cards), texto quase-preto quente; substitui o azul iOS `#007AFF` como cor primaria.
- [x] **VIS-02**: App usa a fonte Nunito (arredondada) como token tipografico, substituindo a fonte de sistema; nenhuma familia de fonte hardcoded fora dos tokens. **CONCLUIDO na fase 23** — os 15 estilos de texto da tela principal adotam `theme.typography.*` (que carrega `fontFamily` Nunito); `grep "fontFamily: '" src/App.tsx` retorna 0. Telas restantes (config/cenas/rotina) recebem o mesmo padrao nas fases 24/25.
- [ ] **VIS-03**: Cuidador pode escolher entre 3 temas — "Salvia & Creme" (padrao), "Terracota" e "Sereno Escuro" (modo escuro calmo que substitui o alto-contraste preto/amarelo agressivo); a escolha persiste apos reiniciar o app. **CODIGO CONCLUIDO** — seletor de 3 temas implementado (plano 22-03), runtime/persistencia prontos desde 22-02; verificacao humana em device/emulador adiada pelo usuario (fazer na fase 25 ou quando conveniente).

### Tela Principal (TELA)

- [x] **TELA-01**: Tela principal usa layout enxuto — sem slogan e sem barra de vocabulario separada da grade; o vocabulario core continua acessivel integrado, sem competir como segunda barra.
- [x] **TELA-02**: Cards de pictograma usam o estilo validado — card limpo com a cor da categoria no bloco atras do pictograma e o rotulo em texto abaixo (nunca etiqueta colorida).
- [x] **TELA-03**: Compositor usa hierarquia "Ouvir heroi" — "Ouvir" e o botao dominante; "Gerar (IA)" fica rotulado e visivel, porem menor, como acao de apoio.
- [x] **TELA-04**: Usuario remove uma figura selecionada com 1 toque na propria figura; um controle discreto "limpar" aparece apenas quando ha figuras e apaga todas.

### Configuracoes (CFG)

- [x] **CFG-01**: Tela de configuracoes usa inicio agrupado em 3 grupos — "App", "Conteudo da crianca" e "Cuidador" — substituindo as 10 abas planas.
- [x] **CFG-02**: Configuracoes usam navegacao drill-down — cada item abre sua propria tela com botao voltar; listas densas de "rotulo + 3 botoes espremidos" sao eliminadas.
- [x] **CFG-03**: Cuidador deslogado ve apenas o grupo "App" disponivel; os demais grupos exibem indicador de bloqueio e pedem senha (sem abas bloqueadas expostas).

### Regressao e Release (REG)

- [ ] **REG-01**: Todos os fluxos v1-v4 (buscar, selecionar, gerar, ouvir, salvar, frases prontas, historico, simbolos pessoais, voz gravada, rotina, categorias, admin) passam regressao sem quebras; `npm run lint` e `npm run test` sem novas falhas; checklist de release atualizado.

---

## Future Requirements (Deferred)

- **Redesenho de layout das telas de Cenas (VSD) e Rotina (visao da crianca)** — nao foram esbocadas nesta rodada; recebem o tema novo automaticamente, mas mantem a estrutura atual.
- **Pictogramas reais do ARASAAC ajustados na paleta nova** — os sketches usaram emoji como stand-in; validar/ajustar os pictogramas reais com a paleta Salvia & Creme.

## Out of Scope

- **Qualquer feature funcional nova** — esta milestone e exclusivamente visual/UX.
- **Mudanca de comportamento dos fluxos v1-v4** — apenas a aparencia muda.
- **Remocao do vocabulario core como funcionalidade** — e preservado; apenas deixa de ter uma barra propria competindo na tela.
- **Novas dependencias nativas que exijam rebuild** alem das ja presentes (expo-haptics, expo-blur permanecem).
- **Navegacao multi-screen (React Navigation)** — app permanece single-screen; o drill-down de configuracoes e troca de estado de View.

---

## Traceability

| REQ-ID  | Category        | Phase    | Notes |
|---------|-----------------|----------|-------|
| VIS-01  | Sistema Visual  | Phase 22 | Concluido (22-01/22-02) — paleta Salvia & Creme em theme.ts, tema aplicado ao shell de App.tsx |
| VIS-02  | Sistema Visual  | Phase 22+23 | Concluido na fase 23 — tela principal aplica theme.typography (Nunito); fontFamily literal = 0 |
| VIS-03  | Sistema Visual  | Phase 22 | Codigo concluido (22-03) — seletor de 3 temas na config; verificacao humana em device adiada pelo usuario (fase 25 ou quando conveniente) |
| TELA-01 | Tela Principal  | Phase 23 | Concluido (23-01/23-03) — slogan removido + vocabulario core integrado a grade |
| TELA-02 | Tela Principal  | Phase 23 | Concluido (23-03) — card com tile de cor de categoria atras do pictograma |
| TELA-03 | Tela Principal  | Phase 23 | Concluido (23-04) — Ouvir dominante (terracota, flex:1.9), Gerar rotulado menor (ouro, flex:1) |
| TELA-04 | Tela Principal  | Phase 23 | Concluido (23-04) — tocar na figura remove (1 toque); link "limpar" contextual |
| CFG-01  | Configuracoes   | Phase 24 | Inicio agrupado em 3 grupos — shell completo desde 24-01; grupo App restilizado em 24-02; aguardando 24-03 (Conteudo da crianca) e 24-04 (Cuidador) |
| CFG-02  | Configuracoes   | Phase 24 | Navegacao drill-down — sistema de rotas + tokens drill* prontos; sub-telas App tokenizadas (24-02); restam grupos Conteudo da crianca (24-03) e Cuidador (24-04) |
| CFG-03  | Configuracoes   | Phase 24 | Gating por grupo — implementado em 24-01 (openConfigRoute redireciona deslogados para 'senha' em rotas nao-APP; cadeados nos grupos bloqueados) |
| REG-01  | Regressao       | Phase 25 | Regressao dos fluxos v1-v4 |

---

**Total:** 11 requirements | **Categorias:** 4 | **Status:** roadmap criado — 11/11 requisitos mapeados (Phases 22-25)
*Milestone v6 - Redesign Visual Calmo | Requisitos definidos em 2026-05-18 | Roadmap em 2026-05-18*
