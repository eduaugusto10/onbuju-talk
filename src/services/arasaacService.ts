import { SymbolItem } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COMMON_TERMS, FALLBACK_CATEGORIES } from '../constants';
import { classifyWordClass } from '../categoryColors';
import { OFFLINE_SYMBOLS } from './offlineSymbols';
import { getOfflineCategory, listOfflineCategories } from './categoryDownloadService';

const API_BASE_URL = 'https://api.arasaac.org/api';
const STATIC_BASE_URL = 'https://static.arasaac.org/pictograms';

// Simple in-memory cache for the current session
const memoryCache = new Map<string, unknown>();

// Persistent cache for common data
const PERSISTENT_CACHE_PREFIX = 'arasaac_cache_';

async function getFromCache<T>(key: string): Promise<T | null> {
  if (memoryCache.has(key)) {
    return memoryCache.get(key) as T;
  }

  try {
    const saved = await AsyncStorage.getItem(PERSISTENT_CACHE_PREFIX + key);
    if (!saved) {
      return null;
    }
    const parsed = JSON.parse(saved) as T;
    memoryCache.set(key, parsed);
    return parsed;
  } catch {
    return null;
  }
}

async function saveToCache(key: string, data: unknown, persistent: boolean = false) {
  memoryCache.set(key, data);
  if (persistent) {
    try {
      await AsyncStorage.setItem(PERSISTENT_CACHE_PREFIX + key, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save to persistent cache:', e);
    }
  }
}

// ARASAAC devolve dezenas de pictogramas com o mesmo rotulo (varios desenhos de
// "pessoa", "gente"...). Mostrar todos confunde a crianca; mantemos o primeiro
// de cada rotulo.
function dedupeByLabel(items: SymbolItem[]): SymbolItem[] {
  const seen = new Set<string>();
  return items.filter(item => {
    const label = item.label.trim().toLowerCase();
    if (seen.has(label)) return false;
    seen.add(label);
    return true;
  });
}

// Mapeia um pictograma cru da API para SymbolItem, incluindo a classe
// gramatical Fitzgerald derivada das tags/keyword — a UI pinta o cartao com ela.
function mapPictogram(item: any, category: string): SymbolItem {
  const primaryKeyword = item.keywords?.find((k: any) => k.type === 1) || item.keywords?.[0];
  return {
    id: item._id.toString(),
    label: primaryKeyword?.keyword || 'Símbolo',
    imageUrl: `${STATIC_BASE_URL}/${item._id}/${item._id}_300.png`,
    category,
    wordClass: classifyWordClass(item.tags, primaryKeyword?.type) ?? undefined
  };
}

async function fetchWithCache(url: string, persistent: boolean = true) {
  const cached = await getFromCache<unknown>(url);
  if (cached) return cached;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) return null;
    const data = await response.json();
    if (Array.isArray(data) && data.length === 0) return data;
    await saveToCache(url, data, persistent);
    return data;
  } finally {
    clearTimeout(timeout);
  }
}

const normalized = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
function offlineSearch(term: string, locale: string) {
  if (locale !== 'pt') return [];
  const aliases: Record<string, string> = { quero: 'querer', mae: 'mãe', nao: 'não' };
  const query = normalized(aliases[normalized(term)] || term);
  const groups: Record<string, string[]> = {
    alimentacao: ['comer', 'beber'], higiene: ['banheiro'], pessoas: ['eu', 'mãe', 'pai'],
    lugares: ['casa', 'escola', 'banheiro'], escola: ['escola', 'brincar'],
    acoes: ['querer', 'comer', 'beber', 'brincar', 'dormir', 'parar', 'ajuda']
  };
  return OFFLINE_SYMBOLS.filter(item => normalized(item.label).includes(query) || groups[query]?.includes(item.label));
}

export const arasaacService = {
  async searchSymbols(term: string, locale: string = 'pt'): Promise<SymbolItem[]> {
    if (!term.trim()) return [];
    const bundled = offlineSearch(term, locale);
    if (bundled.some(item => normalized(item.label) === normalized(term)) || ['quero', 'mae', 'nao'].includes(normalized(term))) return bundled;
    try {
      const url = `${API_BASE_URL}/pictograms/${encodeURIComponent(locale)}/search/${encodeURIComponent(term)}`;
      const data = await fetchWithCache(url);
      if (!Array.isArray(data) || !data.length) return bundled;

      return dedupeByLabel(data.map((item: any) => mapPictogram(item, 'General')));
    } catch (error) {
      console.error('Error searching ARASAAC symbols:', error);
      return bundled;
    }
  },

  async getBestSymbols(locale: string = 'pt'): Promise<SymbolItem[]> {
    // Stable labels, order and bundled images are available even on the first offline launch.
    if (locale === 'pt') return OFFLINE_SYMBOLS;
    // v3: one representative pictogram per term, tagged with its search term as
    // category. ARASAAC returns dozens of distinct pictograms sharing the same
    // label (e.g. many drawings of "eu"), so deduping by id alone flooded the
    // grid with near-identical "eu" cards — confusing for the autistic audience.
    // Pick the top match per term and dedupe by label so each concept shows up
    // exactly once. The term-as-category lets the card tile pick a soft category
    // color (search results are otherwise category-less / 'General').
    const cacheKey = `best_symbols_v5_${locale}`;
    const cached = await getFromCache<SymbolItem[]>(cacheKey);
    if (cached?.length) return cached;

    const results = await Promise.all(COMMON_TERMS.map(term => this.searchSymbols(term, locale)));
    const seenIds = new Set<string>();
    const seenLabels = new Set<string>();
    const finalResults: SymbolItem[] = [];
    results.forEach((termResults, idx) => {
      const term = COMMON_TERMS[idx];
      const pick = termResults.find(item => {
        const label = item.label.trim().toLowerCase();
        return !seenIds.has(item.id) && !seenLabels.has(label);
      });
      if (pick) {
        seenIds.add(pick.id);
        seenLabels.add(pick.label.trim().toLowerCase());
        finalResults.push({ ...pick, category: term });
      }
    });

    if (finalResults.length) await saveToCache(cacheKey, finalResults, true);
    return finalResults;
  },

  async getCategories(locale: string = 'pt'): Promise<string[]> {
    try {
      const cacheKey = `categories_${locale}`;
      const cached = await getFromCache<string[]>(cacheKey);
      if (cached) {
        const downloaded = locale === 'pt' ? await listOfflineCategories() : [];
        return Array.from(new Set([...cached, ...downloaded.map(item => item.category)]));
      }

      const [catData, tagData] = await Promise.all([
        fetchWithCache(`${API_BASE_URL}/pictograms/categories/${locale}`),
        fetchWithCache(`${API_BASE_URL}/pictograms/tags/${locale}`)
      ]);
      
      let allCategories: string[] = [];
      if (catData) {
        if (Array.isArray(catData)) allCategories = [...allCategories, ...catData];
        else if (typeof catData === 'object' && catData !== null) allCategories = [...allCategories, ...Object.keys(catData)];
      }
      if (tagData && Array.isArray(tagData)) allCategories = [...allCategories, ...tagData];

      if (allCategories.length < 5) allCategories = [...allCategories, ...FALLBACK_CATEGORIES];

      const unique = Array.from(new Set(allCategories))
        .filter(c => c && typeof c === 'string' && c.length > 1 && !c.includes('_'))
        .sort((a, b) => a.localeCompare(b, locale));

      if (catData || tagData) await saveToCache(cacheKey, unique, true);
      const downloaded = locale === 'pt' ? await listOfflineCategories() : [];
      return Array.from(new Set([...unique, ...downloaded.map(item => item.category)]));
    } catch (error) {
      console.error('Error fetching ARASAAC categories:', error);
      const downloaded = locale === 'pt' ? await listOfflineCategories().catch(() => []) : [];
      return Array.from(new Set([...FALLBACK_CATEGORIES, ...downloaded.map(item => item.category)]));
    }
  },

  async getSymbolsByCategory(category: string, locale: string = 'pt', forDownload = false): Promise<SymbolItem[]> {
    try {
      if (!forDownload && locale === 'pt') {
        const offline = await getOfflineCategory(category);
        if (offline) return offline;
      }
      // v4: inclui wordClass (codigo de cores Fitzgerald) no item mapeado
      const cacheKey = `category_v4_${category}_${locale}`;
      const cached = await getFromCache<SymbolItem[]>(cacheKey);
      if (!forDownload && cached?.length) return cached;

      const catUrl = `${API_BASE_URL}/pictograms/${encodeURIComponent(locale)}/category/${encodeURIComponent(category)}`;
      const catData = await fetchWithCache(catUrl);
      
      if (catData && Array.isArray(catData) && catData.length > 0) {
        const results = dedupeByLabel(catData.map((item: any) => mapPictogram(item, category)));
        await saveToCache(cacheKey, results, true);
        return results;
      }

      const tagUrl = `${API_BASE_URL}/pictograms/${encodeURIComponent(locale)}/tags/${encodeURIComponent(category)}`;
      const tagData = await fetchWithCache(tagUrl);
      
      if (tagData && Array.isArray(tagData) && tagData.length > 0) {
        const results = dedupeByLabel(tagData.map((item: any) => mapPictogram(item, category)));
        await saveToCache(cacheKey, results, true);
        return results;
      }

      const searchData = forDownload
        ? await fetchWithCache(`${API_BASE_URL}/pictograms/${encodeURIComponent(locale)}/search/${encodeURIComponent(category)}`)
        : null;
      const searchResults = forDownload
        ? (Array.isArray(searchData) ? dedupeByLabel(searchData.map(item => mapPictogram(item, category))) : [])
        : await this.searchSymbols(category, locale);
      if (searchResults.length) await saveToCache(cacheKey, searchResults, true);
      return searchResults;
    } catch (error) {
      if (forDownload) throw new Error('Não foi possível carregar a categoria. Confira sua conexão e tente novamente.');
      console.error('Error fetching symbols by group:', error);
      return offlineSearch(category, locale);
    }
  }
};
