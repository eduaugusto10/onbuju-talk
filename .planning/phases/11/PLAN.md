# PLAN - Phase 11 - Configuracao de Densidade do Grid de Imagens

## Objetivo
Permitir que o usuario escolha, em configuracoes, quantas imagens aparecem por linha no grid principal, com redimensionamento responsivo dos cards, persistencia local da preferencia e boa usabilidade em diferentes tamanhos de tela.

## Escopo
- Adicionar preferencia de densidade de grid no estado e no storage local.
- Expor controle de colunas na secao `Perfil de uso` da configuracao.
- Aplicar quantidade de colunas dinamicamente no `FlatList` de simbolos da home.
- Ajustar tamanho dos cards para evitar sobreposicao, corte de conteudo e toque desconfortavel.
- Manter consistencia com `uiScale` e `contrastMode` existentes.
- Cobrir fluxo com testes focados no comportamento da configuracao e persistencia.

## Fora de Escopo
- Reestruturacao completa de layout da home.
- Alteracao de fonte de dados dos simbolos.
- Mudancas em navegacao, onboarding ou fluxo de intro.
- Ajustes extensivos no grid de grupos customizados (manter comportamento atual, salvo necessidade tecnica pontual).

## Arquivos Alvo
- `src/App.tsx`
- `src/__tests__/App.test.tsx`
- `.planning/phases/11/SUMMARY.md` (encerramento da fase)
- `.planning/STATE.md` (atualizacao de status no fechamento)

## Plano de Implementacao
1. Modelagem da preferencia de colunas
   - Adicionar chave `gridColumns` em `STORAGE_KEYS`.
   - Criar estado local para colunas do grid com default seguro (`3`).
   - Definir limites de seguranca (ex.: minimo `2`, maximo `5`) e normalizacao de valor lido do storage.

2. Hidratacao e persistencia
   - Incluir `gridColumns` no `Promise.all` de bootstrap local.
   - Aplicar valor hidratado antes da renderizacao final para evitar flicker de densidade.
   - Persistir mudancas de colunas via `useEffect`, alinhado ao padrao atual de `uiScale`/`contrastMode`.

3. UI de configuracao (Perfil de uso)
   - Adicionar novo bloco "Imagens por linha" em `configSection === 'perfil'`.
   - Implementar seletores discretos (chips) para valores permitidos.
   - Exibir dica curta sobre impacto visual da densidade para orientar usuario.

4. Aplicacao no grid principal
   - Substituir `numColumns={3}` por `numColumns={gridColumns}` no `FlatList` principal.
   - Ajustar `key` do `FlatList` para incluir densidade (forcar relayout quando colunas mudarem).
   - Tornar largura do card dependente de coluna ativa e largura do container (com fallback/minimo).
   - Validar legibilidade de label e area de toque em colunas maiores.

5. Ajustes de estilo e acessibilidade
   - Revisar espacamentos (`gap`, `padding`, margem interna) para evitar quebra visual.
   - Garantir compatibilidade com `uiScaleFactor` e alto contraste.
   - Verificar se iconografia/texto seguem utilizaveis em densidade alta.

6. Testes automatizados focados
   - Cobrir alteracao de densidade via configuracao e reflexo no layout da home.
   - Cobrir persistencia da preferencia (valor salvo e restaurado no boot).
   - Evitar asserts frágeis de pixel; focar em estado/props/comportamento observavel.

7. Fechamento
   - Executar validacoes (`npm run lint`, `npm run test -- --runInBand`).
   - Documentar resultado em `SUMMARY.md`.
   - Atualizar `STATE.md` com fase concluida e proximo comando recomendado.

## Criterios de Aceite (UAT)
1. Usuario consegue escolher quantidade de imagens por linha na configuracao.
2. Mudanca aplicada em tempo real no grid principal sem travar interface.
3. Preferencia de colunas persiste entre sessoes do app.
4. Em densidades maiores, cards permanecem usaveis (sem sobreposicao, sem corte critico de conteudo).
5. Fluxos principais (buscar, selecionar, gerar, ouvir, salvar) seguem funcionais apos mudanca.
6. `npm run lint` e `npm run test -- --runInBand` concluem sem erros.

## Verificacao
- Validacao manual:
  - abrir configuracao -> perfil -> alterar colunas;
  - confirmar relayout imediato da home;
  - reiniciar app e confirmar restauracao da preferencia;
  - testar cenarios com `uiScale` compacto/padrao/confortavel e contraste alto.
- Validacao automatizada:
  - `npm run lint`
  - `npm run test -- --runInBand`

## Riscos
- Layout quebrar em telas pequenas com densidade maxima.
- Alteracao de `numColumns` em runtime causar artefatos de renderizacao no `FlatList`.
- Persistencia de valor invalido causar estado inconsistente no boot.

## Mitigacoes
- Aplicar clamp de valor (min/max) e fallback para default.
- Forcar relayout com `key` dependente de colunas e ajuste de estilos deterministico.
- Testar transicao entre valores extremos (2 <-> 5) em sequencia.

## Dependencias
- Depends on: `Phase 10 - Regressao e Polimento Final de Entrada` (concluida)
- Desbloqueia: fechamento da Milestone 3 com controle de densidade visual concluido.
