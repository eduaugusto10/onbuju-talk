# PLAN - Phase 5 - Design System e Estrutura da Tela Principal

## Objetivo
Remodelar a tela principal do app com hierarquia visual clara, melhor legibilidade e interacoes mais consistentes, priorizando validacao em iOS sem regressao no Android.

## Escopo
- `src/App.tsx` (estrutura principal da tela e estilos associados)
- Componentes visuais locais usados na home (`CategoryChip`, `ActionButton`, `SymbolCard`, `CachedImage`)
- Sem alterar regras centrais de negocio de cache, IA e persistencia

## Estado Atual (Baseline)
- Home funcional, mas com estrutura visual densa e consistencia limitada entre blocos.
- Configuracao ainda simples (sera aprofundada na Phase 6).
- Base de testes existente para regressao basica.

## Entregas
1. Nova estrutura de layout da home (header, busca, categorias, grade, frase e acoes).
2. Padrao visual consistente de espacamento, tipografia e estados de interacao.
3. Melhor legibilidade de textos e botoes em telas menores.
4. Ajustes de UX para tornar o fluxo buscar -> selecionar -> gerar mais intuitivo.
5. Validacao visual iOS-first e smoke de compatibilidade Android.

## Plano Tecnico
1. Estruturar blocos visuais da home:
   - separar secoes com hierarquia clara (topo, descoberta, selecao, composicao).
   - reduzir poluicao visual com alinhamento e respiro entre areas.
2. Definir mini design-system local:
   - tokenizar tamanhos/espacos/raios/cores em constantes do arquivo.
   - padronizar variantes de botoes e chips (normal, ativo, desabilitado).
3. Melhorar UX de navegacao:
   - reforcar feedback visual de categoria ativa e simbolos selecionados.
   - tornar CTA primario ("Gerar"/"Ouvir") mais evidente.
4. Revisar responsividade:
   - prevenir truncamento e sobreposicao em iPhones menores.
   - garantir comportamento estavel em orientacao padrao e listas curtas.
5. Preservar comportamento:
   - manter fluxo funcional existente (favoritos, customizados, toasts, admin gating).
   - sem regressao das chamadas de servico e persistencia.

## Criterios de Verificacao (UAT)
- Home remodelada com leitura mais clara e hierarquia visual evidente.
- Sem cortes de texto e sem deformacao de botoes na interface principal.
- Fluxo buscar -> selecionar -> gerar -> ouvir continua funcionando sem crash.
- Validacao visual prioritaria em iOS concluida, com smoke check em Android.
- `npm run lint` e `npm run test` sem erros.

## Testes e Validacao
1. Automatizado:
   - executar `npm run lint`.
   - executar `npm run test`.
2. Manual (iOS primeiro):
   - validar busca, troca de categoria e selecao multipla.
   - validar composicao de frase e acoes de gerar/ouvir.
   - validar estados vazios e feedbacks visuais.
3. Manual (Android smoke):
   - repetir fluxo principal para garantir ausencia de regressao.

## Riscos
- Remodelagem visual pode introduzir regressao de usabilidade em partes do fluxo.
- Ajustes agressivos de layout podem impactar componentes ja estaveis.
- Diferencas de render entre iOS e Android podem gerar inconsistencias.

## Mitigacao
- Fazer mudancas incrementais por secao da tela.
- Validar fluxo principal a cada bloco alterado.
- Usar testes existentes como rede minima de seguranca.

## Dependencias
- Depends on: Milestone 2 requirements (concluido)
- Desbloqueia: Phase 6 - Remodelagem da Configuracao e Personalizacao
