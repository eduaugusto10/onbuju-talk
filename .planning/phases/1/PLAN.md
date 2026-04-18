# PLAN - Phase 1 - Hardening de UI e Layout

## Objetivo
Eliminar quebras visuais e cortes de texto nos fluxos principais da tela (`chips de categorias`, `cards`, `acoes` e `estados vazios`) em diferentes tamanhos de tela.

## Escopo
- Ajustes somente de UI/UX e estilos no `src/App.tsx`
- Sem alterar regras de negocio de ARASAAC, IA e cache

## Tarefas
1. Revisar e estabilizar altura/largura dos chips de categoria.
2. Ajustar comportamento dos botoes de acao para nao comprimir texto.
3. Garantir consistencia visual quando lista de simbolos estiver vazia ou curta.
4. Revisar espacos no rodape (frase + botoes) em telas pequenas.
5. Validar renderizacao de cards em 2-3 breakpoints de device.

## Plano de Execucao
1. Mapear estilos candidatos (`categoriesRow`, `categoryButton`, `actionRow`, `actionButton`, `grid`, `footer`).
2. Aplicar ajustes progressivos e pequenos, validando a cada mudanca.
3. Testar cenarios:
   - muitos cards
   - poucos cards
   - nenhum card
   - texto longo em categorias/acoes
4. Consolidar valores finais de padding/minHeight/alinhamento.

## Verificacao (UAT)
- Nenhum texto de categoria aparece cortado.
- Botoes de categoria nao esticam verticalmente em lista vazia.
- Labels de botoes de acao permanecem legiveis.
- Estado vazio nao deforma o layout superior.
- `npm run lint` sem erros.

## Riscos
- Ajustes para um device podem impactar outro.
- Font rendering difere entre Android e iOS.

## Mitigacao
- Preferir `minHeight` + `justifyContent` e evitar dependencias de `lineHeight` agressivo.
- Validar em pelo menos um emulador Android e um dispositivo iOS/Expo Go.
