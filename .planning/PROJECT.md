# PROJECT

## Nome
Fala Mobile

## Resumo
Aplicativo AAC (comunicação aumentativa e alternativa) em React Native/Expo para montagem de frases com símbolos ARASAAC, reprodução por voz e criação de grupos customizados.

## Objetivo
Entregar experiência mobile estável, rápida e offline-friendly para uso diário por pessoas que precisam de apoio de comunicação.

## Current State
- Versao enviada: `v1`
- Milestone 1 concluida e arquivada em `.planning/milestones/v1-ROADMAP.md`.
- Requisitos da v1 arquivados em `.planning/milestones/v1-REQUIREMENTS.md`.
- Milestone 3 concluida e arquivada em `.planning/milestones/v3-ROADMAP.md`.
- Requisitos da v3 arquivados em `.planning/milestones/v3-REQUIREMENTS.md`.

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

## Critérios de Sucesso
- Fluxo principal sem erros visuais e funcionais em Android/iOS
- Tempo de exibição inicial de imagens significativamente menor com cache
- Sem regressões de persistência (favoritos, grupos, ajustes de voz)

## Next Milestone Goals
- Milestone 4: definir novo pacote de evolucoes de produto via `/gsd-new-milestone`.
- Priorizar requisitos com maior impacto em comunicacao assistiva e usabilidade diaria.
- Preservar performance, acessibilidade e ausencia de regressao dos fluxos principais.
- Formalizar requisitos e roadmap antes de iniciar novas fases.
