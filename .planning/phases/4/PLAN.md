# PLAN - Phase 4 - Qualidade e Testes

## Objetivo
Aumentar a confiabilidade do app para evolucao continua, estabelecendo base de testes automatizados para servicos criticos, cobrindo fluxo principal da tela e formalizando checklist de release.

## Escopo
- Setup de infraestrutura de testes (unitarios e componentes basicos)
- `src/services/aiService.ts`
- `src/services/imageCacheService.ts`
- `src/services/arasaacService.ts` (casos essenciais)
- Fluxo principal em `src/App.tsx` (interacoes criticas)
- Documentacao de release em `.planning/` (checklist operacional)

## Estado Atual (Baseline)
- Projeto ainda sem framework de testes configurado.
- `lint` atual usa apenas `tsc --noEmit`.
- Servicos principais ja possuem logica relevante (cache, fallback, retry, admin local), sem cobertura automatizada.

## Entregas
1. Infra de testes configurada para React Native + TypeScript.
2. Testes unitarios de servicos criticos (cache/IA/rede).
3. Testes de fluxo basico da tela principal (render, acao, fallback).
4. Scripts de teste no `package.json` para execucao local.
5. Checklist de release documentado e versionavel.

## Plano Tecnico
1. Setup de testes:
   - adicionar `jest`, `jest-expo`, `@testing-library/react-native` e tipos necessarios.
   - criar arquivos de configuracao (`jest.config`/`setup`) alinhados ao Expo SDK 54.
2. Testes de `aiService`:
   - validar fallback quando chave da IA nao configurada.
   - validar caminho de sucesso com mock de `fetch`.
   - validar retry/timeout com mock de erro/abort.
3. Testes de `imageCacheService`:
   - validar retorno de hit local.
   - validar caminho de miss + download.
   - validar limpeza por tamanho (eviction LRU em cenario controlado).
4. Testes de fluxo em `App.tsx`:
   - render inicial sem crash.
   - fluxo de gerar frase com fallback.
   - gating de acoes admin (favorito/salvar customizado).
5. Checklist de release:
   - itens minimos: lint, testes, validacao manual rapida Android/iOS, secrets/config.
   - registrar passos em arquivo de checklist no projeto.

## Criterios de Verificacao (UAT)
- `npm run lint` sem erros.
- Suite de testes executa com sucesso localmente.
- Casos de fallback criticos (IA indisponivel, cache/rede) possuem cobertura.
- Fluxo principal da tela (buscar, selecionar, gerar, ouvir, salvar com restricao de admin) continua funcional.
- Checklist de release disponivel e utilizavel antes de entrega.

## Testes e Validacao
1. Validacao automatizada:
   - executar `npm run test` (e opcionalmente `npm run test:watch`).
2. Validacao manual rapida:
   - abrir app, buscar simbolos, gerar frase, ouvir voz.
   - validar caminho sem chave da IA configurada.
3. Validacao de release:
   - seguir checklist e registrar pendencias.

## Riscos
- Setup inicial de testes em Expo pode demandar ajustes de mocks.
- Testes de UI podem ficar instaveis sem boas praticas de sincronizacao.
- Cobertura excessiva de detalhes internos pode aumentar manutencao.

## Mitigacao
- Priorizar testes de comportamento e caminhos criticos.
- Usar mocks consistentes para rede e storage.
- Comecar com cobertura enxuta e evoluir incrementalmente.

## Dependencias
- Depends on: Phase 3 (concluida)
