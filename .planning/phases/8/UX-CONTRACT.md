# UX CONTRACT - Phase 8 - Tela Inicial

## Objetivo
Definir um contrato de UX implementavel para a tela de abertura, com regras claras de exibicao, persistencia e transicao para a home atual.

## Estrutura Visual
1. Bloco central:
   - titulo/marca do app;
   - frase curta de orientacao;
   - botao principal `Comecar`.
2. Opcao de persistencia:
   - controle simples (`checkbox`/`toggle`) com texto `Nao mostrar novamente`.
3. Linguagem visual:
   - manter tokens visuais atuais (cores, tipografia, raio e espacos);
   - garantir legibilidade em modo padrao e alto contraste.

## Estados de UI
1. `boot_loading`:
   - leitura da preferencia no `AsyncStorage`;
   - nao exibir home nem intro parcialmente (evitar flicker).
2. `intro_visible`:
   - exibe tela inicial com CTA e opcao de persistencia.
3. `home_visible`:
   - fluxo atual da home sem alteracao funcional.

## Regras de Persistencia
1. Chave local: `intro_skip_enabled`.
2. Formato: string `'1'` (pular) ou `'0'` (mostrar intro).
3. Regra de exibicao:
   - sem valor salvo: mostrar intro;
   - valor `'1'`: pular intro;
   - valor `'0'`: mostrar intro.
4. Momento de salvamento:
   - ao tocar em `Comecar`, persistir a opcao atual antes da transicao.

## Regras de Interacao
1. CTA `Comecar`:
   - transiciona imediatamente para home;
   - previne duplo disparo de transicao.
2. Controle `Nao mostrar novamente`:
   - altera somente a preferencia de proximas aberturas;
   - nao bloqueia o uso imediato do app.

## Contrato de Transicao
1. Entrada:
   - app inicia em `boot_loading`;
   - decide `intro_visible` ou `home_visible` apos hidratar preferencia.
2. Saida:
   - de `intro_visible` para `home_visible` por acao do CTA.
3. Compatibilidade:
   - comportamento igual em iOS e Android;
   - sem alterar arquitetura de navegacao global.

## Mapeamento de Requisitos
- RF1: intro antes da home -> coberto por `intro_visible`.
- RF2: identidade + orientacao -> coberto por `Estrutura Visual`.
- RF3: acao clara para continuar -> coberto por CTA `Comecar`.
- RF4: pular futuras aberturas -> coberto por `Regras de Persistencia`.
- RF5: manter fluxos existentes -> coberto por estado `home_visible` sem mudanca de dominio.

## Critérios de Pronto para Phase 9
1. Implementacao consegue seguir este contrato sem decisoes em aberto.
2. Chave e semantica de persistencia estao definidas.
3. Casos de primeiro uso e uso recorrente estao definidos.
4. Risco de flicker e duplo disparo ja esta tratado no design.
