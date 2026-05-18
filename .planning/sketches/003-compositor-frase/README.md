---
sketch: 003
name: compositor-frase
question: "Como compor a frase e que peso o botão Gerar (IA) deve ter?"
winner: "A"
tags: [composer, actions, ai]
---

# Sketch 003: Compositor de Frase

## Design Question
O compositor é onde a frase vira fala. Tem as figuras selecionadas, a frase
legível, e três ações: limpar, Gerar (IA) e Ouvir. A pergunta central é o peso
do "Gerar": a memória do projeto diz que ele é funcionalidade central e deve
ficar visível — mas ele é opcional (dá pra Ouvir sem gerar). Quanto destaque?

## How to View
open .planning/sketches/003-compositor-frase/index.html

Usa o layout D (sketch 001) e o card D (sketch 002). 3 temas na ferramenta.

## Variants
- **A: Ouvir herói** — "Ouvir" é o maior botão (ação final). "✨ Gerar" ao lado,
  rotulado e visível, porém menor. Hierarquia clara: apoio vs. ação principal.
- **B: Dois botões iguais** — "Gerar" e "Ouvir" lado a lado, mesmo peso.
  Simétrico, mas não comunica qual é o passo final.
- **C: Gerar como convite** — "Ouvir" é o único botão fixo. "✨ Gerar" aparece
  como convite só quando há 2+ figuras; some quando não faz sentido.

## What to Look For
- O "Gerar" está visível e convidativo sem competir com o "Ouvir"?
- Em C: o convite aparecendo/sumindo ajuda ou confunde? (adicione/remova figuras)
- Qual deixa mais claro para a criança "o que apertar para falar"?
- Teste Gerar (organiza a frase) e Ouvir em cada um.

## Decisões
- **Compositor:** A · Ouvir herói. "Ouvir" é o maior botão (ação final = falar a
  frase). "✨ Gerar" ao lado, rotulado com texto e visível — honra a memória
  ([[feedback-generate-button-is-core]]) — mas menor, porque é apoio opcional, não
  obrigatório. Tela estável (sem botões que aparecem/somem) = previsível para TEA.
