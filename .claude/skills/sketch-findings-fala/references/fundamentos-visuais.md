# Fundamentos Visuais

## Design Decisions

### Paleta — "Sálvia & Creme" (escolhida)
O app sai do **azul iOS `#007AFF`** como cor primária. Motivo: o azul iOS competia
visualmente com os pictogramas coloridos do ARASAAC e dava ao app aparência genérica
de "tela de ajustes do iPhone". Entra uma paleta **terrosa, calma, de baixo estímulo
sensorial** — recomendada para o público autista (reduzir sobrecarga sensorial é
restrição de design).

Princípio central: **moldura quieta, pictograma herói**. A interface (cards, barras,
botões) usa tons neutros e suaves; a cor saturada vem do conteúdo (pictograma),
nunca da moldura.

- **Sálvia** (`#6F9D86`) — estado ativo / selecionado
- **Ouro quente** (`#E0A24E`) — a ação "mágica" (Gerar IA)
- **Terracota** (`#D08A63`) — a ação herói (Ouvir / falar)
- **Creme** (`#F1EBDD` / surface `#FCFAF4`) — fundo e cards
- **Texto** `#3B362D` — quase-preto **quente**, nunca preto puro (`#000` é duro demais)

### Tipografia — Nunito
Fonte arredondada, calorosa e amigável. Substitui a fonte de sistema (que parecia
fria/genérica). Pesos 400–800. Import: `@import url('...Nunito:wght@400;500;600;700;800')`.

### Formas e sombras
- **Cantos generosos**: `--radius-md: 16px`, `--radius-lg: 22px`, `--radius-xl: 30px`.
- **Sombras baixas, suaves, tingidas de quente**: `0 6px 16px rgba(74,63,43,0.09)`.
  Nunca sombras duras/pretas.

### Três temas
Sistema de temas via CSS variables. O app deve oferecer:
1. **Sálvia & Creme** (`default`) — tema padrão.
2. **Terracota** — variação mais quente (argila à frente, sálvia recua).
3. **Sereno Escuro** — modo escuro **calmo** (marrom-carvão quente, não preto puro).
   Substitui o alto-contraste preto/amarelo agressivo por um escuro de baixo estímulo.

## CSS Patterns

O tema completo está em `sources/themes/default.css`. Tokens-chave:

```css
:root {
  /* fundo */
  --color-bg:        #F1EBDD;   /* creme — tela */
  --color-bg-soft:   #E8E0CD;   /* áreas agrupadas */
  --color-surface:   #FCFAF4;   /* cards */
  --color-border:    #E2D8C2;
  /* texto */
  --color-text:        #3B362D; /* quase-preto QUENTE */
  --color-text-muted:  #8B8372;
  /* sálvia — ativo/selecionado */
  --color-primary:      #6F9D86;
  --color-primary-soft: #DBE6DE;
  --color-primary-ink:  #2E4A3E;
  /* ouro — ação Gerar (IA) */
  --color-generate:     #E0A24E;
  --color-generate-ink: #5B3F12;
  /* terracota — ação Ouvir */
  --color-accent:       #D08A63;
  /* formas / sombras */
  --radius-md: 16px;  --radius-lg: 22px;  --radius-full: 9999px;
  --shadow-sm: 0 1px 3px rgba(74,63,43,0.07);
  --shadow-md: 0 6px 16px rgba(74,63,43,0.09);
}
```

Na implementação React Native, esses tokens devem entrar em `src/theme.ts`
(o projeto já centraliza tokens lá).

## What to Avoid
- **Azul iOS `#007AFF`** como cor primária — compete com os pictogramas, parece genérico.
- **Preto puro `#000`** em texto — usar quase-preto quente `#3B362D`.
- **Alto-contraste preto/amarelo agressivo** — substituir por "Sereno Escuro".
- **Cor decorativa** — cor só onde informa (ação, categoria), nunca enfeite.
- Sombras duras ou cinza-azuladas — só sombras suaves tingidas de quente.

## Origin
Synthesized from sketch: 001-tela-paleta (vencedor D)
Source files available in: sources/001-tela-paleta/ e sources/themes/
