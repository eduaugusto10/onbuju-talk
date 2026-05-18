# Tela de Configurações

## Design Decisions

### Estrutura — "Início + drill-down" (sketch 004, vencedor A)
A configuração era um bottom sheet com **10 abas planas** numa barra horizontal
(Cuidador, Voz, Acessibilidade, Perfil, Vocabulário, Frases, Símbolos, Categorias,
Rotina, Cenas) — sem agrupamento, misturando ajustes de app com gestão de conteúdo.
Achar algo virava caça ao tesouro.

Nova estrutura: **uma tela de início agrupada em 3 blocos**, cada linha abre uma
**tela própria** com botão voltar. Uma coisa de cada vez (padrão Ajustes do iPhone) —
reduz carga cognitiva.

Os 3 grupos (as 10 seções se reorganizam aqui):
- **App** — Voz, Acessibilidade, Aparência (escala/colunas). Aberto sem senha.
- **Conteúdo da criança** — Vocabulário core, Frases prontas, Símbolos pessoais,
  Categorias, Rotina do dia, Cenas visuais. Exige senha de cuidador.
- **Cuidador** — Senha, Chave da IA, Sair do modo cuidador.

### Decisões de apoio
- **Listas densas eliminadas.** Linhas com "rótulo + 3 botõezinhos espremidos"
  (↑ ↓ ✕) acabam — cada item (símbolo, frase, passo) abre **sua própria tela** com
  espaço para renomear, mudar categoria, gravar voz, reordenar ou apagar.
- **Gating limpo.** Cuidador deslogado vê só o grupo "App" aberto; o resto mostra um
  🔒 e pede senha. Não existem mais 8 abas bloqueadas exibidas na cara do usuário.
- **Segurança desempilhada.** Setup/login/trocar-senha/chave-IA não ficam todos
  amontoados numa aba — viram linhas distintas no grupo "Cuidador".

## CSS Patterns

```css
/* Lista agrupada (inset grouped) */
.sgroup-title {        /* header de grupo: pequeno, caixa alta, mudo */
  font-size: 11px; font-weight: 800; letter-spacing: .6px; text-transform: uppercase;
  color: var(--color-text-muted); padding: 0 8px 7px;
}
.scard {               /* cartão do grupo */
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-sm);
}
.srow {                /* linha clicável: ícone + texto + chevron */
  display: flex; align-items: center; gap: 12px; padding: 13px 14px; width: 100%;
}
.srow + .srow { border-top: 1px solid var(--color-border); }   /* hairline interna */
.sicon {               /* ícone em chip arredondado */
  width: 38px; height: 38px; border-radius: 11px;
  background: var(--color-primary-soft);
}
.srow.danger .slabel { color: var(--color-danger); }            /* "Sair" */
```

## HTML / Navigation Structures
```
Tela INÍCIO ("Ajustes")
 ├─ grupo APP                 → linhas drilláveis (›)
 ├─ grupo CONTEÚDO DA CRIANÇA → linhas drilláveis (›), 🔒 se deslogado
 └─ grupo CUIDADOR            → senha, chave IA, [Sair] (danger)

Toca numa linha → tela de DETALHE
 ├─ header: ‹ Ajustes  +  título
 └─ controles daquele assunto, só daquilo
```
Navegação: cada linha tem `data-go="alvo"`; voltar tem `data-go="home"`.
Em React Native (app single-screen, sem navigation library) isto vira troca de
estado de uma `View` de detalhe sobreposta — não precisa de lib de navegação.

## What to Avoid
- **10+ abas planas** numa barra horizontal — sem hierarquia, impossível achar.
- **Tudo numa tela só** com listas densas de rótulo + 3 botões minúsculos.
- **Amontoar segurança** (setup + login + trocar senha + chave IA) numa única aba.
- **Mostrar abas bloqueadas** para o cuidador deslogado — usar 🔒 e gating por grupo.

## Origin
Synthesized from sketch: 004-tela-configuracoes (vencedor A)
Source files available in: sources/004-tela-configuracoes/
