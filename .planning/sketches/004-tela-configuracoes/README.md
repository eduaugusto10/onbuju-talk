---
sketch: 004
name: tela-configuracoes
question: "Como reorganizar as 10 abas planas de configurações para deixar de ser confuso?"
winner: "A"
tags: [settings, navigation, ia]
---

# Sketch 004: Tela de Configurações

## Design Question
Hoje a configuração é um bottom sheet com 10 abas planas numa barra horizontal
(Cuidador, Voz, Acessibilidade, Perfil, Vocabulário, Frases, Símbolos, Categorias,
Rotina, Cenas) — sem agrupamento, misturando ajustes de app com gestão de conteúdo.
Achar algo é caça ao tesouro. Como dar hierarquia? As 10 seções agrupam em 3:
**App** (voz, acessibilidade, aparência), **Conteúdo da criança** (vocabulário,
frases, símbolos, categorias, rotina, cenas), **Cuidador** (senha, chave IA, sair).

## How to View
open .planning/sketches/004-tela-configuracoes/index.html

## Variants
- **A: Início + drill-down** — lista de início agrupada em 3 blocos; toca numa
  linha → tela só daquilo, com voltar. Uma coisa de cada vez (Ajustes do iPhone).
- **B: 3 abas grandes** — 10 abas viram 3 (App/Conteúdo/Cuidador); seções
  empilhadas dentro de cada aba. Mais raso, sem telas separadas.
- **C: Painel de cartões** — orientado a tarefa: faixa de ajustes rápidos no topo
  + cartões grandes e visuais para gerenciar conteúdo, com contagens.

## What to Look For
- A: navegar até "Voz" e "Símbolos" — uma coisa por tela parece mais calmo?
- B: trocar de aba — 3 abas resolve sem precisar de telas separadas?
- C: cartões visuais ajudam o cuidador ou ocupam espaço demais?
- Onde o cuidador acha algo mais rápido? Onde a tela fica menos cheia?

## Decisões
- **Configurações:** A · Início + drill-down. As 10 abas planas viram uma lista
  de início agrupada em 3 blocos (App / Conteúdo da criança / Cuidador); cada
  linha abre uma tela própria com botão voltar. Uma coisa por vez = menos carga
  cognitiva, alinhado com o princípio de menos etapas/menos poluição. Listas
  densas (rótulo + 3 botões espremidos) eliminadas: cada item ganha sua tela.
  Deslogado, só "App" fica aberto; o resto mostra 🔒 (sem 8 abas bloqueadas).
