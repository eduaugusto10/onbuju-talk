# PLAN - Phase 6 - Remodelagem da Configuracao e Personalizacao

## Objetivo
Transformar a configuracao atual em uma experiencia completa e intuitiva, com opcoes relevantes de personalizacao e acessibilidade, mantendo fluxo admin/IA seguro e simples de usar.

## Escopo
- `src/App.tsx` (modal/tela de configuracao e ajustes de voz)
- Persistencia local em `AsyncStorage` para novas preferencias de UX/acessibilidade
- Ajustes visuais complementares no design system local da fase anterior

## Estado Atual (Baseline)
- Configuracao existe, porem ainda esta simples e com opcoes limitadas.
- Fluxo admin e chave IA funcional, mas pouco guiado.
- Ajustes de voz separados em modal proprio com opcoes basicas.

## Entregas
1. Nova experiencia de configuracao organizada por secoes (Perfil de uso, Acessibilidade, Voz, Seguranca/IA).
2. Unificacao dos ajustes essenciais (incluindo voz) em fluxo mais coerente.
3. Novas opcoes de personalizacao util:
   - escala de interface (compacta, padrao, confortavel);
   - contraste (padrao/alto);
   - preferencias de feedback visual.
4. Melhorias de usabilidade no fluxo admin:
   - estados e instrucoes mais claras;
   - menos friccao para login/alteracao de senha.
5. Fluxo de chave IA com orientacao contextual e confirmacao clara de salvamento.

## Plano Tecnico
1. Estruturar o container da configuracao:
   - criar layout em secoes com titulos, descricoes curtas e controles agrupados.
   - reduzir campos simultaneos na tela via condicional de estado (wizard leve por secao quando necessario).
2. Consolidar configuracoes de voz:
   - mover ou espelhar ajustes de velocidade/tom para a configuracao principal.
   - manter acao de "testar voz" e feedback de sucesso/erro.
3. Implementar preferencias de acessibilidade/personalizacao:
   - criar novos estados + chaves de storage para escala visual, contraste e feedback.
   - aplicar esses estados na UI principal sem quebrar layout da Phase 5.
4. Refinar fluxo de seguranca:
   - melhorar copy e ordem de campos para setup/login/troca de senha admin.
   - manter hash local e restricoes minimas de senha ja existentes.
5. Refinar fluxo de IA:
   - adicionar instrucoes de quando usar chave local vs env.
   - manter salvamento local opcional sem expor segredo na UI.
6. Preservar regressao minima:
   - garantir que favoritos/customizados/admin gating continuem funcionando.

## Criterios de Verificacao (UAT)
- Tela de configuracao deixa de ser "pobre" e passa a ter secoes claras e opcoes uteis.
- Ajustes de voz, acessibilidade e personalizacao ficam acessiveis em fluxo unico e compreensivel.
- Fluxo admin (setup/login/alteracao) permanece seguro e mais intuitivo.
- Fluxo de chave IA permanece funcional e orientado.
- `npm run lint` e `npm run test` sem erros.

## Testes e Validacao
1. Automatizado:
   - executar `npm run lint`;
   - executar `npm run test`.
2. Manual iOS-first:
   - abrir configuracao, navegar por secoes e salvar preferencias.
   - validar setup/login/troca de senha admin.
   - validar ajuste/teste de voz e salvamento da chave IA.
   - confirmar impacto visual da personalizacao na tela principal.
3. Manual Android smoke:
   - repetir fluxo basico de configuracao para checar ausencia de regressao.

## Riscos
- Aumento de opcoes pode gerar configuracao poluida se nao houver boa hierarquia.
- Novas preferencias podem causar inconsistencia visual entre plataformas.
- Misturar ajustes avancados com seguranca pode confundir usuarios sem guia clara.

## Mitigacao
- Usar agrupamento por secao e microtextos objetivos.
- Aplicar defaults seguros com possibilidade de reset.
- Validar interacoes principais em iOS durante desenvolvimento incremental.

## Dependencias
- Depends on: Phase 5 (concluida)
- Desbloqueia: Phase 7 - Polimento iOS, Regressao e Estabilizacao Final
