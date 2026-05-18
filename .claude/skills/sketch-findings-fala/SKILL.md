---
name: sketch-findings-fala
description: Validated design decisions, CSS patterns, and visual direction from sketch experiments. Auto-loaded during UI implementation on fala (Fala Mobile, app AAC para crianças autistas).
---

<context>
## Project: fala (Fala Mobile)

App AAC (comunicação alternativa) para crianças autistas. App Expo single-screen;
toda a UI vive em `src/App.tsx`, tokens de design em `src/theme.ts`.

Direção de design validada por sketches: **calma e acolhedora**. Paleta terrosa de
baixo estímulo sensorial (sálvia, creme, terracota), molduras quietas para que os
pictogramas coloridos do ARASAAC sejam o herói visual. Sai de cena o azul iOS
`#007AFF` genérico. Restrição dura: simplicidade acima de riqueza de features.

Sem referência visual externa fornecida — princípios aplicados: apps AAC dedicados
(grade grande, moldura neutra) + design infantil de baixo estímulo.

Sketch sessions wrapped: 2026-05-18
</context>

<design_direction>
## Overall Direction

- **Paleta:** "Sálvia & Creme" — sálvia `#6F9D86` (ativo), ouro `#E0A24E` (Gerar IA),
  terracota `#D08A63` (Ouvir), creme `#F1EBDD` (fundo), texto quase-preto quente
  `#3B362D`. Cor só onde informa, nunca decorativa.
- **Tipografia:** Nunito (arredondada, calorosa), pesos 400–800.
- **Formas:** cantos generosos (16–30px), sombras baixas e suaves tingidas de quente.
- **Temas:** Sálvia & Creme (padrão), Terracota, Sereno Escuro (modo escuro calmo).
- **Layout:** enxuto — cortar tudo que não informa; ~8 blocos na tela principal.
- **Interação:** menos etapas (apagar figura = 1 toque); tela estável e previsível
  (nada que aparece/some sem motivo); moldura quieta, pictograma herói.
- **Navegação de ajustes:** início agrupado + drill-down (uma coisa por tela).
</design_direction>

<findings_index>
## Design Areas

| Área | Referência | Decisão-chave |
|------|-----------|---------------|
| Fundamentos visuais | references/fundamentos-visuais.md | Paleta Sálvia & Creme, Nunito, 3 temas; fora o azul iOS |
| Tela principal | references/tela-principal.md | Layout enxuto, card com cor de categoria no tile, Ouvir herói, apagar em 1 toque |
| Configurações | references/configuracoes.md | 10 abas planas → início agrupado + drill-down |

## Theme

O tema vencedor está em `sources/themes/default.css` (Sálvia & Creme).
Variações: `sources/themes/terracota.css`, `sources/themes/sereno-escuro.css`.
Na implementação, portar os tokens para `src/theme.ts`.

## Source Files

Os HTMLs originais dos sketches (com todas as variantes, vencedora marcada com ★)
estão preservados em `sources/` para referência visual completa. Abrir no navegador.
</findings_index>

<metadata>
## Processed Sketches

- 001-tela-paleta
- 002-card-pictograma
- 003-compositor-frase
- 004-tela-configuracoes
</metadata>
