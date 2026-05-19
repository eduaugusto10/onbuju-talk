/**
 * Mapeamento categoria ARASAAC -> familia de cor suave (paleta "Salvia & Creme").
 *
 * As categorias do ARASAAC sao dinamicas; esta funcao associa cada nome de
 * categoria a uma das 5 familias de cor pastel definidas no skill
 * `sketch-findings-fala` (`references/tela-principal.md`, secao "Card de
 * pictograma"). Categorias sem correspondencia caem no tom neutro.
 *
 * Modulo de funcao pura — sem I/O, sem strings de UI. Consumido pelo card de
 * pictograma na fase 23-03 para pintar o "tile" atras do pictograma.
 */

/** As 6 familias de cor de categoria (5 pasteis + tom neutro), valores hex. */
export const CATEGORY_COLOR_FAMILIES = {
  acoes: '#DBE6DE',
  comida: '#F6E6C7',
  pessoas: '#F0DCCE',
  lazer: '#E3E8D2',
  rotina: '#E7E0EC',
  neutro: '#ECE6D8'
} as const;

/** Chave de uma familia de cor de categoria. */
export type CategoryColorFamily = keyof typeof CATEGORY_COLOR_FAMILIES;

/**
 * Termos pt-BR (minusculos, sem acento) por familia. A familia `neutro` nao
 * aparece aqui — e o fallback quando nenhum termo casa.
 */
const FAMILY_KEYWORDS: Record<Exclude<CategoryColorFamily, 'neutro'>, string[]> = {
  acoes: ['acoes', 'acao', 'verbos', 'verbo', 'fazer'],
  comida: ['alimentacao', 'comida', 'comer', 'beber', 'bebida', 'lanche', 'fruta', 'frutas'],
  pessoas: ['pessoas', 'pessoa', 'familia', 'pessoal', 'gente', 'eu'],
  lazer: ['lazer', 'brincar', 'brinquedo', 'brinquedos', 'jogo', 'jogos', 'escola', 'diversao'],
  rotina: ['rotina', 'higiene', 'saude', 'casa', 'lugares', 'lugar', 'sentimentos', 'sentimento', 'dia']
};

/** Normaliza texto: minusculo, sem acentos, sem espacos nas pontas. */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

/**
 * Quebra um texto normalizado em tokens alfanumericos (separadores: espaco,
 * hifen, barra, virgula, etc.). Permite casar por palavra inteira em vez de
 * substring crua — evita falsos positivos como "acao" dentro de "alimentacao".
 */
function tokenize(s: string): string[] {
  return s.split(/[^a-z0-9]+/).filter(Boolean);
}

/**
 * Resolve um nome de categoria ARASAAC para a cor hex da sua familia.
 *
 * Normaliza a entrada, quebra em tokens de palavra e procura a primeira
 * familia cuja lista de keywords contenha um termo igual a um dos tokens da
 * entrada. Sem correspondencia retorna o tom neutro.
 */
export function categoryColorFamily(category: string | undefined | null): string {
  if (!category) {
    return CATEGORY_COLOR_FAMILIES.neutro;
  }

  const input = normalize(category);
  if (!input) {
    return CATEGORY_COLOR_FAMILIES.neutro;
  }

  const tokens = tokenize(input);
  if (tokens.length === 0) {
    return CATEGORY_COLOR_FAMILIES.neutro;
  }

  for (const family of Object.keys(FAMILY_KEYWORDS) as Exclude<CategoryColorFamily, 'neutro'>[]) {
    const matched = FAMILY_KEYWORDS[family].some(term => tokens.includes(term));
    if (matched) {
      return CATEGORY_COLOR_FAMILIES[family];
    }
  }

  return CATEGORY_COLOR_FAMILIES.neutro;
}
