---
sketch: 001
name: tela-paleta
question: "A paleta calma terrosa e a estrutura geral da tela funcionam para o app AAC?"
winner: "D"
tags: [layout, palette, shell]
---

# Sketch 001: Tela & Paleta

## Design Question
Esta é a decisão de maior risco: define a paleta e a estrutura de toda a tela.
Aplica a direção "calma e acolhedora" (tons terrosos, baixo estímulo) ao app
inteiro e testa três formas de organizar cabeçalho + grade de pictogramas +
compositor de frase numa única tela.

## How to View
open .planning/sketches/001-tela-paleta/index.html

3 temas disponíveis na ferramenta inferior-direita: Sálvia & Creme (padrão),
Terracota e Sereno Escuro (modo escuro calmo).

## Variants

Round 1 — direções de layout:
- **A: Moldura Calma** — estrutura vertical clássica refinada. Cabeçalho suave,
  grade no meio, compositor ancorado embaixo como bandeja. Tudo sempre visível.
- **B: Foco no Conteúdo** — moldura mínima, pictogramas maiores dominam a tela.
  Compositor flutua como bandeja elevada com botão Ouvir circular em destaque.
- **C: Dois Blocos** — tela dividida em "1 · Escolher" e "2 · Minha frase".
  Separação visual forte reduz carga cognitiva — bom para TEA.

Round 2 — refinamento por declutter (feedback: "tela com muita coisa"):
- **D: Enxuto ✄** — Layout A sem o slogan, sem a barra de vocabulário (redundante),
  categorias 7→5. De ~11 blocos para 8.
- **E: Modo Foco ✄** — corte radical. Categorias viram um botão, título some,
  busca recolhe. Sobra grade grande + frase + um botão. De ~11 blocos para 5.

Aba F — apagar figuras (3 jeitos comparados):
- **1 · Tocar para tirar** ★ ESCOLHIDA — toca na figura, ela some. Link "limpar"
  discreto apaga tudo. Uma etapa só.
- 2 · Backspace estilo teclado.
- 3 · Modo editar com − estilo iOS.

## Decisões
- **Layout:** D · Enxuto — mantém título/busca/categorias, mas sem slogan, sem
  barra de vocabulário redundante, categorias 7→5. ~8 blocos na tela.
- **Tema:** Sálvia & Creme (default.css) — verde-sálvia + creme quente.
- **Apagar figuras:** opção 1 (tocar para tirar). Razão do usuário: uma única
  etapa é o melhor para crianças autistas — menos carga cognitiva. Toque acidental
  é barato de desfazer (recolocar = 1 toque), então sem confirmação. O badge ✕
  vermelho e a caixa-lixeira da rodada anterior foram descartados (feios).
  Aplicado nas telas D e E.

## What to Look For
- A paleta terrosa transmite calma sem parecer apagada/sem vida?
- Os pictogramas se destacam da moldura? (a moldura deve ser quieta)
- D vs E: até onde dá pra cortar antes de perder função? Memória registra que
  o botão Gerar (✨) deve continuar visível — ele está mantido inline em ambos.
- Teste os 3 temas — qual temperatura agrada mais?
