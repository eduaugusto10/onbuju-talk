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
  acoes: ['acoes', 'acao', 'verbos', 'verbo', 'fazer', 'querer', 'ajuda', 'apoio'],
  comida: ['alimentacao', 'comida', 'comer', 'beber', 'bebida', 'lanche', 'fruta', 'frutas'],
  pessoas: ['pessoas', 'pessoa', 'familia', 'pessoal', 'gente', 'eu', 'mae', 'pai', 'mamae', 'papai'],
  lazer: ['lazer', 'brincar', 'brinquedo', 'brinquedos', 'jogo', 'jogos', 'jogar', 'escola', 'diversao'],
  rotina: ['rotina', 'higiene', 'saude', 'casa', 'lugares', 'lugar', 'sentimentos', 'sentimento', 'dia', 'banheiro', 'dormir']
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
 * Familias de cor por classe gramatical (Fitzgerald Key, versao lavada).
 *
 * Codigo de cores classico de CAA: a cor do cartao indica a funcao da palavra
 * na frase (pessoa, acao, coisa...), ensinando a ordem sujeito-verbo-objeto
 * pela sequencia de cores. Tons dessaturados para manter o baixo estimulo da
 * paleta Salvia & Creme.
 */
export const WORD_CLASS_COLORS = {
  /** Amarelo manteiga — pessoas e pronomes (eu, voce, mae). */
  pessoas: '#F5E7BA',
  /** Verde salvia lavado — verbos (querer, comer, ir). */
  acoes: '#DBE6DE',
  /** Pessego — substantivos (agua, bola, casa). */
  coisas: '#F6DEC2',
  /** Azul acinzentado lavado — adjetivos (grande, feliz). */
  descritores: '#D8E3E8',
  /** Rosa queimado lavado — sociais, expressoes e advérbios (sim, nao, oi). */
  sociais: '#F2DBD3'
} as const;

/**
 * Variante saturada das mesmas familias — mais proxima dos tons do Fitzgerald
 * classico. O cuidador escolhe em Ajustes > Aparencia; util para criancas que
 * precisam de distincao de cor mais obvia (ex.: baixa visao).
 */
export const WORD_CLASS_COLORS_STRONG = {
  pessoas: '#F2CE4B',
  acoes: '#8FBF9A',
  coisas: '#EFA663',
  descritores: '#8FB2CC',
  sociais: '#E59AA4'
} as const;

/** Classe gramatical de uma palavra no codigo Fitzgerald. */
export type WordClass = keyof typeof WORD_CLASS_COLORS;

/** Intensidade das cores por funcao: lavada (padrao) ou saturada. */
export type WordClassColorStrength = 'suave' | 'forte';

/**
 * Tags do ARASAAC que identificam cada classe. A ordem define a prioridade:
 * tags de funcao gramatical (pronoun/verb/adjective/adverb) decidem primeiro —
 * "comer" vem com "verb" E "person" (o desenho tem uma pessoa) e precisa ser
 * verde. "family" fica por ultimo: pega substantivos de gente (mae, pai) sem
 * capturar todo pictograma que desenha uma pessoa.
 */
const WORD_CLASS_TAGS: [WordClass, string[]][] = [
  ['pessoas', ['pronoun', 'personal pronoun']],
  ['acoes', ['verb', 'usual verbs']],
  ['descritores', ['adjective', 'qualifying adjective']],
  ['sociais', ['adverb', 'expression', 'interjection', 'polite set expression']],
  ['pessoas', ['family']]
];

/**
 * Fallback pelo campo `keywords[].type` do ARASAAC quando as tags nao decidem.
 * Mapa levantado empiricamente na API pt-BR: 1=pronome, 2=substantivo,
 * 3=verbo, 4=adjetivo/adverbio, 5=expressao.
 */
const KEYWORD_TYPE_CLASS: Record<number, WordClass> = {
  1: 'pessoas',
  2: 'coisas',
  3: 'acoes',
  4: 'descritores',
  5: 'sociais'
};

/**
 * Classifica um pictograma ARASAAC na familia Fitzgerald a partir das `tags`
 * e, em ultimo caso, do `type` da keyword principal. Retorna null quando nao
 * ha como saber (o caller cai na cor de categoria tematica ou no neutro).
 */
export function classifyWordClass(tags: unknown, keywordType?: unknown): WordClass | null {
  const tagSet = new Set(
    Array.isArray(tags) ? tags.filter((t): t is string => typeof t === 'string') : []
  );
  for (const [wordClass, classTags] of WORD_CLASS_TAGS) {
    if (classTags.some(tag => tagSet.has(tag))) {
      return wordClass;
    }
  }
  if (typeof keywordType === 'number' && KEYWORD_TYPE_CLASS[keywordType]) {
    return KEYWORD_TYPE_CLASS[keywordType];
  }
  return null;
}

/** Cor hex da classe na intensidade pedida, ou null sem classe (caller decide o fallback). */
export function wordClassColor(
  wordClass: WordClass | null | undefined,
  strength: WordClassColorStrength = 'suave'
): string | null {
  if (!wordClass) return null;
  return strength === 'forte' ? WORD_CLASS_COLORS_STRONG[wordClass] : WORD_CLASS_COLORS[wordClass];
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
