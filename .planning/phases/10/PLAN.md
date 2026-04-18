# PLAN - Phase 10 - Regressao e Polimento Final de Entrada

## Objetivo
Validar a estabilidade do novo fluxo de abertura (intro) e aplicar polimentos finais de UX visual em iOS/Android, sem regressao dos fluxos principais.

## Escopo
- Regressao funcional dos fluxos criticos apos `Phase 9`.
- Polimento visual da tela inicial para legibilidade/contraste.
- Verificacao de comportamento da preferencia `intro_skip_enabled`.
- Ajustes pontuais em `src/App.tsx` e testes somente quando necessario.
- Atualizacao dos artefatos finais da milestone (summary/checklist/state).

## Fora de Escopo
- Novas features de onboarding.
- Mudancas de arquitetura de navegacao.
- Integracoes remotas para conteudo da intro.

## Arquivos Alvo
- `src/App.tsx`
- `src/__tests__/App.test.tsx`
- `.planning/RELEASE-CHECKLIST.md` (se existir e precisar de update)
- `.planning/phases/10/SUMMARY.md`
- `.planning/STATE.md`

## Plano de Execucao
1. Auditoria de regressao dos fluxos principais
   - Confirmar continuidade de:
     - busca e filtros de categorias;
     - selecao de simbolos;
     - gerar frase;
     - ouvir TTS;
     - salvar customizados;
     - abertura/configuracao.
   - Garantir que entrada via intro nao impacta funcionalidades da home.

2. Validacao do fluxo de abertura
   - Primeiro acesso: intro aparece.
   - Acao `Comecar`: transicao para home sem travamento.
   - Opcao `Nao mostrar novamente`: persiste e pula intro em nova abertura.
   - Sem flicker perceptivel entre `boot_loading`, `intro_visible` e `home_visible`.

3. Polimento visual final (iOS/Android)
   - Revisar contraste e legibilidade dos elementos da intro.
   - Ajustar espacamentos/tamanho de toque se necessario.
   - Manter consistencia com o design system ja aplicado na home.

4. Testes automatizados
   - Reforcar/asserts existentes para reduzir risco de regressao da entrada.
   - Manter testes focados e de alto valor (sem inflar suite com redundancia).
   - Executar:
     - `npm run lint`
     - `npm run test -- --runInBand`

5. Fechamento da fase
   - Documentar resultado em `SUMMARY.md`.
   - Atualizar `STATE.md` para refletir fase concluida.
   - Preparar terreno para fechamento da milestone (`/gsd-complete-milestone`).

## Criterios de Aceite (UAT)
1. Fluxo de abertura permanece estavel em cenarios de primeiro acesso e acesso recorrente.
2. Preferencia `intro_skip_enabled` funciona de forma consistente entre sessoes.
3. Fluxos principais continuam funcionais sem regressao.
4. Intro com boa legibilidade/contraste em iOS e Android.
5. `npm run lint` e `npm run test -- --runInBand` sem erros.

## Verificacao
- Revisao visual/manual:
  - estado de loading de boot;
  - tela intro;
  - transicao para home.
- Verificacao automatizada:
  - `npm run lint`
  - `npm run test -- --runInBand`

## Riscos
- Regressao silenciosa em fluxo da home por mudanca no gate de entrada.
- Ajuste visual pontual introduzir inconsistencias em alto contraste.
- Divergencia de comportamento entre iOS e Android em timing de render.

## Mitigacoes
- Validar fluxo completo apos qualquer ajuste de entrada.
- Manter mudancas pequenas, localizadas e com teste de cobertura associado.
- Priorizar ajustes de estilo sem alterar semantica da logica de estado.

## Dependencias
- Depends on: `Phase 9 - Implementacao da Tela Inicial e Persistencia` (concluida)
- Proximo passo esperado: fechamento da milestone 3
