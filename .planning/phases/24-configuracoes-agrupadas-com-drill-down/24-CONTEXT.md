# Phase 24: Configuracoes Agrupadas com Drill-down - Context

**Gathered:** 2026-05-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Redesenha a tela de configuracoes do cuidador. Hoje sao 10 abas planas numa barra
horizontal (Cuidador, Voz, Acessibilidade, Perfil, Vocabulario, Frases, Simbolos,
Categorias, Rotina, Cenas) misturando ajustes do app com gestao de conteudo. A
nova estrutura agrupa em 3 blocos com drill-down — uma coisa por tela.

Fonte de design: skill `sketch-findings-fala/references/configuracoes.md`
(vencedor A — Início + drill-down). Sketch interativo:
`.planning/sketches/004-tela-configuracoes/`.

Os 3 grupos:
- **App** (aberto sem senha): Voz · Acessibilidade · Aparencia (escala UI, colunas da grade)
- **Conteudo da crianca** (gated por senha): Vocabulario core · Frases prontas · Simbolos pessoais · Categorias · Rotina do dia · Cenas visuais
- **Cuidador**: Senha · Chave da IA · Sair do modo cuidador

</domain>

<decisions>
## Implementation Decisions

### Estrategia e estrutura
- Planos por regiao: (1) shell agrupado (home com 3 grupos) + sistema de drill-down ; (2) grupo App (Voz, Acessibilidade, Aparencia) ; (3) grupo Conteudo da crianca (6 itens) ; (4) grupo Cuidador (Senha, Chave IA, Sair).
- Navegacao drill-down via View overlay com estado — SEM React Navigation. Coerente com o app single-screen (CLAUDE.md) e a OoS da milestone. Estado novo: `configRoute` (ex.: 'home' | 'voz' | 'acessibilidade' | 'aparencia' | 'vocabulario' | 'frases' | 'simbolos' | 'categorias' | 'rotina' | 'cenas' | 'senha' | 'chave-ia').
- O `IOSBottomSheet` existente continua sendo o container externo; o INTERIOR e redesenhado para a navegacao drill-down.

### Lista agrupada e drill-down
- Estilo "inset grouped" como no sketch 004 variante A: header de grupo pequeno em caixa alta (UPPERCASE pt-BR muted); cartao do grupo com hairlines internas; linha com icone-chip + texto + chevron ›.
- Tela de detalhe: header com botao voltar ('‹ Ajustes' a esquerda) e titulo; corpo com os controles daquele assunto.
- Botoes "Sair do modo cuidador" estilizados como linha-perigo (`color: theme.colors.danger`).

### Gating e segurança
- Deslogado: apenas o grupo "App" e clicavel. As linhas dos grupos "Conteudo da crianca" e "Cuidador" mostram um cadeado 🔒 e, ao tocar, levam ao prompt de senha (aproveitando o fluxo `needsAdminSetup` / `setAdminPassword` existente).
- Os 3 fluxos hoje amontoados na aba "Cuidador" (criar senha / login / trocar senha) ficam distribuidos: criar/login pelo gate de senha; trocar senha como linha propria dentro do grupo "Cuidador" quando logado.

### Reuso e preservação de funcionalidade
- TODA a logica dos editores existentes e preservada verbatim: vocabulario core (reorder/add/remove/reset), frases prontas (edit/delete/clear history), simbolos pessoais (camera/galeria/draft/audio), categorias customizadas, rotina (passos com dias e draft), cenas (hotspots). Apenas o INVOLUCRO (a tela onde vivem) e novo.
- Listas densas com "rotulo + 3 botoes espremidos" (vocabulario core, frases, rotina) sao eliminadas: cada item ganha sua propria sub-tela para renomear/reordenar/apagar/gravar voz, ou — quando ainda for util — a lista permanece mas com mais espaco respiravel.
- Componentes existentes reusados: `OptionChip`, `IOSBottomSheet`, `Switch`, `CategoryButton` quando aplicavel.

### Tipografia e tokens
- Todo texto reestilizado adota `theme.typography.*` (que carrega `fontFamily` Nunito) — mantem VIS-02 fechado.
- Cores: tokens da paleta "Salvia & Creme" (`theme.colors.*`); sem azul iOS, sem cinzas iOS.
- Cantos generosos; sombras suaves; raios `theme.radii.lg` para cartoes de grupo.

### Escopo
- Phase 24 mexe SOMENTE no interior da configuracao. Tela principal (fase 23) e tema (fase 22) intactos. Cenas (VSD) e Rotina na visao da CRIANCA ficam Deferred.

### Claude's Discretion
- Particoes exatas dos planos por grupo e como cortar.
- Quando converter cada item em sub-tela vs lista in-place espaçada.
- Detalhes de copy pt-BR dos rotulos e dicas.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `IOSBottomSheet` (em `src/ui/`) — container do modal de config; mantido.
- `ConfigNavItem` — sera substituido pelas linhas agrupadas (`.srow`).
- `OptionChip` — reusado para Voz (velocidade/tom), Aparencia (escala/colunas).
- `Switch` nativo — reusado para Acessibilidade (alto contraste vira tema escuro; feedback visual permanece).
- Editores existentes: `addCoreWord`/`removeCoreVocabularyWord`/`moveCoreVocabularyWord`; `addPhrase`/`updatePhrase`/`removePhrase`; `pickFromCamera`/`pickFromGallery`; `addCustomCategory`/`removeCustomCategory`; rotina (`routineSteps`, `routineDraft`); cenas (`visualScenes`, `editExistingScene`).
- Estado `isAdmin` / `hashSecret` / `adminPasswordHash` — fluxo de auth intacto.
- `STORAGE_KEYS` — nenhuma chave nova necessaria; toda persistencia ja existe.

### Established Patterns
- App single-screen monolitico em `src/App.tsx`; estilos via `makeStyles(theme)` + `useMemo` (fase 22).
- Estado de config atualmente via `configSection` ('seguranca' | 'voz' | ...); sera substituido por `configRoute` (home + detalhes).
- pt-BR para strings; TypeScript strict; lint = `tsc --noEmit`.
- Anti-padroes do skill: nao acumular controles em uma linha densa; nao mostrar abas bloqueadas; uma coisa por tela.

### Integration Points
- `src/App.tsx` — bloco do `configSection`, navegacao interna do `IOSBottomSheet`, todos os editores. E AQUI que vive 100% da refatoracao.

</code_context>

<specifics>
## Specific Ideas

- Decisoes visuais e estrutura: `.claude/skills/sketch-findings-fala/references/configuracoes.md` (vencedor A — drill-down) e sketch 004 (HTML interativo).
- Anti-padroes a evitar: 10+ abas planas; tudo numa tela so com listas densas; amontoar segurança numa aba; mostrar abas bloqueadas para deslogado.

</specifics>

<deferred>
## Deferred Ideas

- Verificacao humana em device da fase 22 — fase 25.
- Redesenho de layout das telas Cenas (VSD) e Rotina (visao da crianca) — Future Requirements.
- Ajuste fino dos pictogramas reais do ARASAAC na paleta — Future Requirements.

</deferred>
