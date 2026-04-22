# PROJECT

## Nome
Fala Mobile

## Resumo
Aplicativo AAC (comunicação aumentativa e alternativa) em React Native/Expo para montagem de frases com símbolos ARASAAC, reprodução por voz e criação de grupos customizados.

## Objetivo
Entregar experiência mobile estável, rápida e offline-friendly para uso diário por pessoas que precisam de apoio de comunicação.

## Current State
- Versao enviada: `v3`
- Milestone 1 concluida e arquivada em `.planning/milestones/v1-ROADMAP.md`.
- Requisitos da v1 arquivados em `.planning/milestones/v1-REQUIREMENTS.md`.
- Milestone 3 concluida e arquivada em `.planning/milestones/v3-ROADMAP.md`.
- Requisitos da v3 arquivados em `.planning/milestones/v3-REQUIREMENTS.md`.
- Milestone v4 (Comunicacao Pessoal e Rotina Visual) concluida em 2026-04-21 (12/12 requisitos, aguardando arquivamento).
- Milestone ativa: v5 - Refatoracao de Design no Estilo iOS.

## Current Milestone: v5 Refatoracao de Design no Estilo iOS

**Goal:** Refatorar a aparencia do Fala Mobile para o idioma visual do iOS (iPhone), preservando a funcionalidade completa entregue nas milestones v1-v4 e a restricao dura de simplicidade para o publico autista.

**Target features:**
- Design system iOS: tokens de cor (system blue, grays, grouped backgrounds), tipografia SF-like, escala de espacamento, raios de canto, sombras sutis
- Header no estilo Navigation Bar do iOS
- Barra de categorias como Segmented Control / pills horizontais estilo iOS
- Campo de busca em estilo iOS search field
- Grid de simbolos com cards iOS (raio, sombra, tap feedback)
- Composer e botoes em variantes iOS (Filled/Tinted/Plain)
- Modais convertidos para Bottom Sheets com grabber e backdrop desfocado (expo-blur)
- Config "Ajustes" estilo iOS (inset grouped list, chevrons, switches)
- Haptic feedback em toques principais via expo-haptics

**Contexto-chave:**
- Escopo exclusivamente visual/UX — zero mudanca de funcionalidade
- Preservar fluxos das milestones 1-4 (composer, vocabulario core, frases prontas, historico, simbolos pessoais, voz gravada, rotina visual, categorias customizadas, admin)
- Novas deps nativas (expo-haptics, expo-blur) requerem rebuild
- Respeitar modo high-contrast e escala UI existentes
- Numeracao de fases continua a partir da Phase 17

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

**Last updated:** 2026-04-21 (inicio da milestone v5 - refatoracao iOS)
