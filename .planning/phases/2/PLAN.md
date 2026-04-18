# PLAN - Phase 2 - Performance de Midia e Cache

## Objetivo
Reduzir o tempo percebido de carregamento das imagens e tornar o cache previsivel com politica de expiracao/limpeza e observabilidade basica.

## Escopo
- `src/services/imageCacheService.ts`
- Integracao de metricas e pre-warm em `src/App.tsx`
- Sem alterar regras de negocio de categorias/favoritos/admin

## Entregas
1. Politica de cache com TTL (expiracao por idade) para imagens.
2. Limpeza automatica e segura de arquivos expirados.
3. Pre-warm controlado para evitar rajadas desnecessarias.
4. Instrumentacao de hit/miss/download/error para diagnostico local.
5. Ajustes de UX para nao bloquear renderizacao durante cache fill.

## Plano Tecnico
1. Adicionar metadados de cache em AsyncStorage:
   - chave por URI remota
   - `localPath`, `savedAt`, `lastAccessAt`
2. Implementar validacao de TTL em `getCachedImageUri`:
   - hit valido: retorna arquivo local e atualiza `lastAccessAt`
   - expirado/invalido: remove arquivo e baixa novamente
3. Implementar limpeza opportunistic:
   - rotina leve acionada no startup/prewarm
   - limite de itens por ciclo para evitar travamento
4. Melhorar `warmImageCache`:
   - limitar concorrencia (ex.: 4-6 downloads simultaneos)
   - ignorar URIs ja validas no cache
5. Expor metricas simples:
   - `cacheHit`, `cacheMiss`, `cacheDownload`, `cacheError`, `evicted`
   - helper para reset/get snapshot em dev
6. Ajustar `App.tsx` para pre-warm somente quando a lista realmente muda.

## Criterios de Verificacao (UAT)
- Reabrir categoria recentemente vista mostra imagens mais rapido.
- Em segunda carga, maioria das imagens relevantes vem de hit local.
- Arquivos antigos expiram de acordo com TTL configurado.
- App continua funcional se limpeza falhar (fail-safe).
- `npm run lint` sem erros.

## Testes e Validacao
1. Validacao manual:
   - primeira abertura (miss/download)
   - segunda abertura (hit)
   - simulacao de expiracao (TTL curto em dev)
2. Verificar que render nao fica bloqueada durante pre-warm.
3. Confirmar logs/metricas coerentes em ambiente de desenvolvimento.

## Riscos
- TTL agressivo pode reduzir ganho de performance.
- Limpeza pesada pode impactar UX em aparelhos fracos.
- Concorrencia alta pode gerar uso excessivo de rede/disco.

## Mitigacao
- Retencao persistente sem TTL, com limpeza por tamanho para evitar recarga frequente.
- Limpeza incremental por lotes pequenos.
- Concorrencia limitada e fallback para URI remota em falhas.

## Dependencias
- Depends on: Phase 1 (concluida)

## Decisao Aplicada
- Para reduzir espera no uso neurodivergente, a expiracao por tempo (TTL) foi substituida por retencao persistente com limpeza por tamanho (LRU).
