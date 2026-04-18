# PLAN - Phase 9 - Implementacao da Tela Inicial e Persistencia

## Objetivo
Implementar a tela inicial de abertura do app em `src/App.tsx`, com persistencia local da preferencia "Nao mostrar novamente", seguindo o contrato UX definido na `Phase 8`.

## Escopo
- Implementar fluxo de entrada com 3 estados:
  - `boot_loading` (hidrata preferencia);
  - `intro_visible` (tela inicial);
  - `home_visible` (tela principal atual).
- Criar UI da tela inicial com marca, mensagem curta, CTA `Comecar` e opcao `Nao mostrar novamente`.
- Persistir preferencia local com `AsyncStorage` em chave `intro_skip_enabled`.
- Garantir transicao sem flicker e sem disparo duplo do CTA.
- Adicionar/atualizar testes focados no novo fluxo de abertura.

## Fora de Escopo
- Onboarding multi-etapas.
- Conteudo remoto/dinamico na tela inicial.
- Reescrita de arquitetura de navegacao.

## Arquivos Alvo
- `src/App.tsx` (principal implementacao da entrada)
- `src/__tests__/App.test.tsx` (cobertura de regressao da abertura)

## Plano de Implementacao
1. Estados e bootstrap de preferencia
   - Adicionar estados locais para hidratar e decidir exibicao da intro.
   - Ler `intro_skip_enabled` no boot com fallback seguro.
   - Evitar render parcial da home durante hidratacao.

2. Tela inicial (intro)
   - Implementar bloco visual com:
     - titulo/marca;
     - mensagem curta;
     - botao `Comecar`;
     - controle `Nao mostrar novamente`.
   - Reusar tokens visuais existentes para consistencia com layout atual.

3. Transicao e persistencia
   - Ao clicar em `Comecar`, persistir opcao atual e trocar para home.
   - Blindar contra clique duplo no CTA durante persistencia/transicao.
   - Garantir que a escolha afete proximas aberturas e nao trave uso atual.

4. Integracao com fluxo atual
   - Manter intactos os fluxos:
     - buscar, selecionar, gerar, ouvir, salvar e configuracao.
   - Garantir que o topo unificado e busca colapsavel continuem funcionando apos entrada na home.

5. Testes
   - Cobrir no minimo:
     - primeiro acesso mostra intro;
     - CTA leva para home;
     - preferencia de pular persiste e evita intro em nova abertura;
     - regressao basica da home principal apos pular intro.

## Criterios de Aceite (UAT)
1. Tela inicial aparece no primeiro acesso.
2. `Comecar` leva para home sem atraso perceptivel.
3. `Nao mostrar novamente` persiste entre sessoes.
4. App abre direto na home quando preferencia estiver ativa.
5. Fluxos principais continuam funcionais.
6. `npm run lint` e `npm run test -- --runInBand` passam sem erros.

## Verificacao
- Revisao visual rapida iOS/Android:
  - legibilidade;
  - contraste;
  - ausencia de flicker na entrada.
- Validacao automatizada:
  - `npm run lint`
  - `npm run test -- --runInBand`

## Riscos
- Flicker na troca de estado de entrada se boot/hidratacao nao estiver bem controlado.
- Regressao em testes por mudanca no ponto inicial de render.
- Persistencia inconsistente caso chave/serializacao nao sejam tratadas de forma unica.

## Mitigacoes
- Introduzir gate explicito de `boot_loading` antes de decidir tela inicial/home.
- Ajustar testes para refletir novo fluxo sem fragilizar asserts.
- Centralizar leitura/escrita da chave `intro_skip_enabled` em funcoes claras no `App.tsx`.

## Dependencias
- Depends on: `Phase 8 - Contrato UX da Tela Inicial` (concluida)
- Desbloqueia: `Phase 10 - Regressao e Polimento Final de Entrada`
