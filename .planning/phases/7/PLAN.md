# PLAN - Phase 7 - Polimento iOS, Regressao e Estabilizacao Final

## Objetivo
Consolidar a milestone com foco iOS-first, removendo regressoes de UX e comportamento apos as fases 5 e 6, e preparando a base para fechamento com validacao tecnica e funcional.

## Escopo
- `src/App.tsx` (polimentos visuais e de interacao, com prioridade iOS)
- `src/__tests__/App.test.tsx` e testes de servicos proximos ao fluxo principal, quando necessario
- Artefatos de milestone/checklist em `.planning/` para fechamento consistente
- Sem reescrita arquitetural e sem introduzir backend remoto de configuracao

## Estado Atual (Baseline)
- Home e configuracao ja remodeladas nas fases 5 e 6.
- Persistencia local de preferencias (escala, contraste, feedback visual) ativa.
- Fluxos principais funcionais e validacao automatizada verde no ultimo ciclo.
- Ainda falta rodada final de polimento iOS + regressao orientada por fluxo completo.

## Entregas
1. Polimento iOS em pontos de legibilidade, espacamento, responsividade e estados visuais.
2. Smoke de compatibilidade Android apos ajustes iOS, sem quebra de fluxo.
3. Regressao funcional dos fluxos principais:
   - buscar;
   - selecionar simbolos;
   - gerar frase;
   - ouvir TTS;
   - salvar grupo customizado.
4. Regressao de configuracao e seguranca:
   - perfil/acessibilidade/voz persistindo corretamente;
   - setup/login/troca de senha admin;
   - salvamento de chave IA com feedback claro.
5. Checklist final da milestone atualizado para preparar fechamento/ship.

## Plano Tecnico
1. Mapear hotspots de UX iOS:
   - revisar componentes com maior densidade (header, composer, modal de configuracao, chips/abas).
   - corrigir inconsistencias de tipografia, contraste, toque e espacos.
2. Executar ajustes visuais incrementais:
   - preservar tokens e padrao visual introduzidos nas fases anteriores.
   - evitar alteracoes de logica de negocio quando o problema for apenas de apresentacao.
3. Rodar regressao funcional guiada por risco:
   - validar fluxo completo em ordem de uso real.
   - confirmar que preferencias e estados persistem apos reinicio do app.
4. Cobrir lacunas de testes apenas quando houver risco real:
   - atualizar/ajustar testes existentes se houver regressao detectada.
   - adicionar teste pontual somente para comportamento critico novo ou corrigido.
5. Fechar artefatos de estabilizacao:
   - registrar resultados e pendencias residuais.
   - preparar status para comando de conclusao de milestone.

## Criterios de Verificacao (UAT)
- Interface iOS sem cortes de texto, sobreposicoes ou estados incoerentes nos fluxos principais.
- Android passa em smoke check dos fluxos essenciais sem regressao evidente.
- Fluxo principal (buscar -> selecionar -> gerar -> ouvir -> salvar) permanece estavel.
- Fluxo de configuracao (perfil/acessibilidade/voz/seguranca-IA) permanece funcional e persistente.
- Sem regressao de seguranca no fluxo admin/IA.
- `npm run lint` e `npm run test -- --runInBand` sem erros.

## Testes e Validacao
1. Automatizado:
   - executar `npm run lint`;
   - executar `npm run test -- --runInBand`.
2. Manual iOS-first:
   - validar home completa (busca, categorias, grade, composicao, acoes);
   - validar modal de configuracao em todas as secoes;
   - validar setup/login/troca de senha admin e logout;
   - validar impacto visual de escala/contraste/feedback e persistencia apos reinicio.
3. Manual Android smoke:
   - repetir fluxo essencial de uso para detectar regressao rapida.

## Riscos
- Polimentos visuais tardios podem gerar regressao indireta em componentes ja estaveis.
- Diferencas iOS/Android podem reaparecer em layout e interacoes de toque.
- Ajustes de ultima fase podem mascarar problemas se nao houver checklist objetivo.

## Mitigacao
- Executar mudancas pequenas e validar imediatamente cada bloco ajustado.
- Priorizar correcoes com impacto funcional/visual direto no uso diario.
- Registrar explicitamente resultado de cada fluxo de regressao no resumo da fase.

## Dependencias
- Depends on: Phase 6 (concluida)
- Desbloqueia: Fechamento da Milestone 2 (`/gsd-complete-milestone`)
