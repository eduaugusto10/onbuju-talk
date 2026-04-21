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
- Milestone ativa: v4 - Comunicacao Pessoal e Rotina Visual (em definicao).

## Current Milestone: v4 Comunicacao Pessoal e Rotina Visual

**Goal:** Evoluir o Fala Mobile de um montador de frases para uma ferramenta de comunicacao diaria personalizada, com vocabulario estavel, conteudo familiar (fotos e voz do cuidador) e rotinas visuais.

**Target features:**
- Vocabulario core em pt-BR com motor planning (posicoes fixas para palavras essenciais)
- Banco de frases prontas para acesso em um toque
- Historico de frases recentes reutilizaveis
- Criacao de simbolos via camera do dispositivo
- Importacao de simbolos da galeria de fotos
- Gravacao de voz do cuidador como alternativa ao TTS
- Rotina visual / agenda do dia (sequencia de simbolos)
- Categorias customizaveis pelo cuidador

**Contexto-chave:**
- Publico-alvo: criancas autistas; simplicidade acima de riqueza de features (restricao dura)
- Botao "Gerar (IA)" permanece visivel no fluxo padrao
- Numeracao de fases continua a partir da Phase 12

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

**Last updated:** 2026-04-21 (inicio da milestone v4)
