# Tela Principal

A tela única de montagem de frases: cabeçalho, categorias, grade de pictogramas e
compositor. Cobre layout, card de pictograma e barra de composição.

## Design Decisions

### Layout — "Enxuto" (sketch 001, vencedor D)
A tela tinha ~11 blocos competindo por atenção. Cortes feitos (público autista —
menos é mais):
- **Removido o slogan** ("comunicação assistiva") — decoração, criança não lê.
- **Removida a barra de vocabulário core separada** — era redundante; *eu, quero,
  sim, não* já vivem na grade. (Atenção: o ROADMAP v4 da Phase 12 pede faixa fixa de
  core — reconciliar: o core pode ser a primeira linha fixa DA grade, não uma 2ª barra.)
- **Categorias reduzidas** de 7 → ~5 visíveis.
Resultado: ~8 blocos. Estrutura vertical: header (engrenagem · "Fala" · busca) →
fileira de categorias → grade → compositor ancorado embaixo como "bandeja".

### Card de pictograma (sketch 002, vencedor D)
Card limpo com cor de categoria como "tapete" do pictograma:
- Card branco-quente (`--color-surface`), borda leve, sombra `sm`, cantos `radius-md`.
- Pictograma dentro de um **bloco/tile** com a **cor suave da categoria** (não cinza).
- **Rótulo é texto** simples abaixo — nunca etiqueta/barra colorida.
- Cores de categoria (5 pastéis suaves): ações `#DBE6DE`, comida `#F6E6C7`,
  pessoas `#F0DCCE`, lazer `#E3E8D2`, rotina `#E7E0EC`.
- Estrela de favorito: overlay circular no canto superior direito.

### Compositor (sketch 003, vencedor A — "Ouvir herói")
- Faixa da frase: chips das figuras + link discreto **"limpar"** + botão **✨ Gerar** inline.
- Linha legível com a frase falada.
- Linha de ações: **🔊 Ouvir** é o botão dominante (~2× a largura); **✨ Gerar**
  ao lado, rotulado com texto, visível porém menor. Ouvir é a ação final (falar);
  Gerar é apoio opcional. Hierarquia honesta.
- Gerar **sempre visível e rotulado** — é funcionalidade central do app.

### Apagar figura (sketch 001-F, vencedor opção 1)
**Tocar na figura selecionada remove ela** — uma etapa só, com animação de "pop".
Para limpar tudo, um link **"limpar"** discreto aparece ao lado do ✨ — só quando há
figuras; some quando a frase está vazia. Sem confirmação (recolocar = 1 toque).

## CSS Patterns

```css
/* Card de pictograma — cor de categoria no tile */
.pcard[data-cat="comida"] { --cat: #F6E6C7; }
.pcard {
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: var(--radius-md); box-shadow: var(--shadow-sm);
  display: flex; flex-direction: column; align-items: center; gap: 7px; padding: 11px;
}
.pcard .pic {            /* o "tapete" colorido atrás do pictograma */
  width: 56px; height: 56px; border-radius: 14px; background: var(--cat);
  display: flex; align-items: center; justify-content: center;
}
.pcard .plabel { font-size: 13px; font-weight: 800; color: var(--color-text); }

/* Compositor — Ouvir herói */
.actions { display: flex; gap: 9px; }
.btn-gen   { flex: 1;   background: var(--color-generate); color: var(--color-generate-ink); }
.btn-speak { flex: 1.9; background: var(--color-accent);   color: #fff; }  /* herói */

/* Chip da frase — apagar em 1 toque (sem badge) */
.chip { transition: transform .16s ease, opacity .16s ease; }
/* onClick: chip.style.transform='scale(0)'; opacity='0'; remove após 175ms */
```

## HTML Structures
```
composer
 ├─ phrase-strip:  [chips...] [link "limpar"] [✨ Gerar inline]
 ├─ readline:      frase legível
 └─ actions:       [✨ Gerar]      [🔊 Ouvir  ───────]   (Ouvir ~2x)
```

## What to Avoid
- **Badge ✕ vermelho** em cada figura — parece adesivo de erro. Tocar na figura basta.
- **Caixa/botão de lixeira** dedicado — usar link "limpar" contextual.
- **Barra de vocabulário core separada** da grade — redundante.
- **Rótulo como etiqueta colorida** no card — rótulo é texto; a cor fica no tile.
- **Gerar e Ouvir do mesmo tamanho** — sugere que Gerar é obrigatório (não é).
- **Gerar como elemento que aparece/some** — quebra previsibilidade (importa p/ TEA).
- Slogan/textos decorativos na tela da criança.

## Origin
Synthesized from sketches: 001-tela-paleta, 002-card-pictograma, 003-compositor-frase
Source files available in: sources/001-tela-paleta/, sources/002-card-pictograma/, sources/003-compositor-frase/
