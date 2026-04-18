# PLAN - Phase 8 - Contrato UX da Tela Inicial

## Objetivo
Definir um contrato UX claro e executavel para a tela inicial de abertura do app, cobrindo estrutura visual, estados, transicoes e regra de persistencia para "nao mostrar novamente".

## Escopo
- Definicao de experiencia da tela inicial no contexto atual de `src/App.tsx`.
- Contrato de comportamento para exibicao da abertura (primeiro uso vs usos seguintes).
- Regras de transicao da abertura para a tela principal (sem alterar navegacao global).
- Criterios de verificacao para implementacao da `Phase 9`.
- Sem implementacao completa da feature nesta fase (foco em contrato e plano tecnico).

## Estado Atual (Baseline)
- App abre direto na tela principal.
- Fluxo principal (buscar, selecionar, gerar, ouvir, salvar) estabilizado.
- Persistencia local com `AsyncStorage` ja utilizada para preferencias (escala, contraste, feedback etc).
- Header/categorias foi unificado recentemente e busca ficou colapsavel.

## Entregas
1. Contrato da UI da tela inicial:
   - marca/titulo;
   - mensagem curta de orientacao;
   - CTA principal "Comecar";
   - opcao "Nao mostrar novamente".
2. Contrato de estado e persistencia:
   - chave local para preferencia de pular abertura;
   - regra de inicializacao no boot do app;
   - regra de override (reabrir onboarding no futuro via configuracao fica fora de escopo agora).
3. Contrato de transicao:
   - entrada na abertura;
   - saida para home principal;
   - comportamento em iOS/Android com foco em fluidez e sem flicker.
4. Checklist de aceitacao para a `Phase 9` implementar sem ambiguidades.

## Contrato UX (Especificacao)
1. Layout da abertura:
   - fundo consistente com tema atual;
   - bloco central com nome do app e frase curta de apoio;
   - CTA principal em destaque visual;
   - toggle/checkbox simples para "Nao mostrar novamente".
2. Estados obrigatorios:
   - `loading` curto durante leitura da preferencia;
   - `show_intro = true` exibe abertura;
   - `show_intro = false` vai direto para home.
3. Interacoes:
   - tocar em "Comecar" leva para home imediatamente;
   - se "Nao mostrar novamente" estiver ativo, persistir antes de transicionar;
   - toque repetido no CTA nao pode disparar transicao dupla.
4. Persistencia:
   - nome sugerido da chave: `intro_skip_enabled`;
   - valor booleano serializado (`'1'`/`'0'`), alinhado ao padrao atual do app.

## Plano Tecnico (Para Execucao na Phase 9)
1. Adicionar estado local para controle da abertura:
   - `isBootHydrating` (carregando preferencia);
   - `showIntroScreen` (exibir abertura);
   - `skipIntroNextOpen` (valor do toggle).
2. Carregar preferencia no boot via `AsyncStorage.getItem`.
3. Renderizacao condicional:
   - enquanto hidrata: estado leve de carregamento;
   - se abrir intro: render da tela inicial;
   - senao: render da home atual.
4. Salvar preferencia ao confirmar CTA.
5. Garantir compatibilidade com fluxo atual sem mexer no dominio de simbolos.

## Criterios de Verificacao (UAT)
- Contrato descreve sem ambiguidades:
  - estrutura da tela inicial;
  - estados e transicoes;
  - persistencia e regra de exibicao.
- Todas as decisoes da milestone 3 (requirements) mapeadas para itens implementaveis.
- `Phase 9` fica desbloqueada com passos objetivos e testaveis.

## Testes e Validacao (Planejamento)
1. Validacao do contrato contra `.planning/REQUIREMENTS.md`.
2. Revisao de aderencia ao estado atual de `src/App.tsx` (sem conflito com fluxos existentes).
3. Definicao previa dos testes que serao aplicados na `Phase 9`:
   - abertura aparece no primeiro acesso;
   - opcao de pular persiste;
   - fluxo principal segue funcional.

## Riscos
- Contrato incompleto pode causar retrabalho na implementacao da `Phase 9`.
- Ambiguidade em persistencia pode gerar comportamento inconsistente entre sessoes.
- Introduzir tela de abertura sem definir estado de boot pode causar flicker.

## Mitigacao
- Registrar explicitamente estados, gatilhos e transicoes.
- Reusar padroes de persistencia ja existentes no app.
- Manter contrato enxuto e focado no necessario para implementacao imediata.

## Dependencias
- Depends on: Milestone 3 requirements definidos
- Desbloqueia: `Phase 9 - Implementacao da Tela Inicial e Persistencia`
