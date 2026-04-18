# PLAN - Phase 3 - Seguranca e Robustez

## Objetivo
Reduzir riscos operacionais e de seguranca removendo segredos hardcoded, fortalecendo controle de admin local e padronizando tratamento de falhas de rede com fallback previsivel.

## Escopo
- `src/services/aiService.ts`
- `src/App.tsx` (fluxo admin e mensagens de erro)
- Novo servico utilitario para configuracao/segredo local (se necessario)
- Sem alterar UX principal de selecao de simbolos e cache de imagens

## Estado Atual (Baseline)
- Chave da IA hardcoded em `aiService.ts`.
- Senha admin hardcoded (`adm123`) em `App.tsx`.
- Tratamento de erro de rede existe, mas sem estrategia de retry padronizada.

## Entregas
1. Remocao de segredo hardcoded do codigo fonte.
2. Chave de IA lida de configuracao local (`EXPO_PUBLIC_*` ou storage local de setup).
3. Senha admin configuravel localmente, sem valor fixo no source.
4. Retry basico com backoff curto para chamadas de rede criticas.
5. Fallback consistente em erros de API, timeout e indisponibilidade.
6. Mensagens de erro claras para usuario final e logs uteis em dev.

## Plano Tecnico
1. Isolar configuracao sensivel:
   - criar camada de leitura de config (`env + fallback`) para IA.
   - falhar com mensagem amigavel quando nao configurado.
2. Refatorar `aiService.ts`:
   - remover literal da API key.
   - encapsular fetch com timeout e retry (ex.: 2 tentativas adicionais).
   - manter cache de resposta local existente.
3. Endurecer fluxo admin em `App.tsx`:
   - remover comparacao com senha fixa.
   - armazenar senha admin definida localmente (primeiro uso/setup).
   - validar com regra minima (tamanho minimo) e mensagens claras.
4. Padronizar erros de rede:
   - mapear erros comuns (`429`, `403`, timeout, offline) para mensagens de UI.
   - garantir fallback de frase simples quando IA indisponivel.
5. Revisar logs:
   - reduzir exposicao de dados sensiveis em logs.
   - manter logs apenas de diagnostico relevante em dev.

## Criterios de Verificacao (UAT)
- Nenhum segredo sensivel aparece hardcoded no repositorio.
- Login admin continua funcional com senha definida localmente.
- Falhas temporarias de rede tentam retry e recuperam quando possivel.
- Quando IA falha, app continua gerando frase fallback sem travar fluxo.
- Mensagens de erro sao compreensiveis para usuario nao tecnico.
- `npm run lint` sem erros.

## Testes e Validacao
1. Validacao manual de configuracao de chave:
   - sem chave configurada -> erro orientativo.
   - com chave configurada -> geracao normal.
2. Validacao manual de admin:
   - definir/alterar senha local.
   - autenticar com sucesso/erro esperado.
3. Simulacao de rede:
   - timeout e status `429/403` com fallback consistente.
4. Verificacao tecnica:
   - `npm run lint`.
   - busca no codigo por segredos hardcoded.

## Riscos
- Fluxo de setup de senha pode gerar atrito no primeiro uso.
- Retry mal calibrado pode aumentar latencia percebida.
- Mudancas no fluxo de IA podem impactar geracao de frase.

## Mitigacao
- Setup simples com defaults seguros e orientacao na UI.
- Retry curto com limite pequeno (2 tentativas) e timeout definido.
- Fallback imediato para frase simples quando exceder tentativas.

## Dependencias
- Depends on: Phase 2 (concluida)
