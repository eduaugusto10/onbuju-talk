# PROJECT

## Nome
Fala Mobile

## Resumo
Aplicativo AAC (comunicação aumentativa e alternativa) em React Native/Expo para montagem de frases com símbolos ARASAAC, reprodução por voz e criação de grupos customizados.

## Objetivo
Entregar experiência mobile estável, rápida e offline-friendly para uso diário por pessoas que precisam de apoio de comunicação.

## Current State
- Versao enviada: `v5`
- Milestones 1, 3, 4 e 5 concluidas e arquivadas em `.planning/milestones/`.
- Milestone ativa: v6 - Redesign Visual Calmo.

## Current Milestone: v6 Redesign Visual Calmo

**Goal:** Aplicar ao app real a direcao de design validada nos 4 sketches — paleta calma "Salvia & Creme", layout enxuto, novos cards, compositor reorganizado e configuracoes em drill-down — substituindo a estetica iOS azul da v5.

**Target features:**
- Sistema de tema "Salvia & Creme" em `src/theme.ts`: paleta terrosa de baixo estimulo sensorial, fonte Nunito, raios/sombras suaves, 3 temas (claro, terracota, escuro calmo)
- Tela principal redesenhada: layout enxuto, card de pictograma com cor de categoria, compositor "Ouvir heroi", apagar figura em 1 toque
- Tela de configuracoes reorganizada: 10 abas planas viram 3 grupos (App / Conteudo da crianca / Cuidador) com navegacao drill-down
- Regressao dos fluxos v1-v4 sem quebras e preparacao de release

**Contexto-chave:**
- Escopo visual/UX — sem features funcionais novas; preservar toda a funcionalidade v1-v4
- Decisoes de design empacotadas no skill `sketch-findings-fala` (auto-carregado em trabalho de UI)
- Sketches interativos preservados em `.planning/sketches/`
- Substitui a estetica iOS azul da v5 (que competia visualmente com os pictogramas)
- Respeitar modo de contraste e escala de UI existentes
- Numeracao de fases continua a partir da Phase 22

## Stack Atual
- Expo SDK 54
- React Native 0.81
- TypeScript strict
- AsyncStorage
- expo-speech
- expo-file-system (cache de imagens)

## Funcionalidades Atuais
- Busca de símbolos ARASAAC
- Filtro por categorias e favoritos
- Montagem de frase por seleção de símbolos
- Geração de frase normalizada (IA)
- Reprodução de voz
- Grupos customizados
- Modo admin básico
- Cache local (dados e imagens)

## Restrições
- Dependência de API externa para catálogo (ARASAAC)
- Dependência opcional de chave de IA para normalização avançada
- Sem suíte completa de testes E2E (apenas unit/integration leve)
- Simplicidade prevalece sobre riqueza de features (publico autista)

## Critérios de Sucesso
- Fluxo principal sem erros visuais e funcionais em Android/iOS
- Tempo de exibição inicial de imagens significativamente menor com cache
- Sem regressões de persistência (favoritos, grupos, ajustes de voz)

## Next Milestone Goals
- Milestone v4 em execucao: ver secao "Current Milestone" acima.
- Preservar performance, acessibilidade e ausencia de regressao dos fluxos principais.
- Formalizar requisitos e roadmap antes de iniciar novas fases.

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---

**Last updated:** 2026-05-18 (inicio da milestone v6 - redesign visual calmo)
