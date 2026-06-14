import { SymbolItem } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COMMON_TERMS, FALLBACK_CATEGORIES } from '../constants';

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

async function fetchWithCache(url: string, persistent: boolean = false) {
  const cached = await getFromCache<unknown>(url);
  if (cached) return cached;

  const response = await fetch(url);
  if (!response.ok) return null;
  const data = await response.json();
  await saveToCache(url, data, persistent);
  return data;
}

export const arasaacService = {
  async searchSymbols(term: string, locale: string = 'pt'): Promise<SymbolItem[]> {
    try {
      const url = `${API_BASE_URL}/pictograms/${locale}/search/${term}`;
      const data = await fetchWithCache(url);
      if (!data) return [];
      
      return data.map((item: any) => ({
        id: item._id.toString(),
        label: item.keywords.find((k: any) => k.type === 1)?.keyword || item.keywords[0]?.keyword || 'Símbolo',
        imageUrl: `${STATIC_BASE_URL}/${item._id}/${item._id}_300.png`,
        category: 'General',
      }));
    } catch (error) {
      console.error('Error searching ARASAAC symbols:', error);
      return [];
    }
  },

  async getBestSymbols(locale: string = 'pt'): Promise<SymbolItem[]> {
    // v3: one representative pictogram per term, tagged with its search term as
    // category. ARASAAC returns dozens of distinct pictograms sharing the same
    // label (e.g. many drawings of "eu"), so deduping by id alone flooded the
    // grid with near-identical "eu" cards — confusing for the autistic audience.
    // Pick the top match per term and dedupe by label so each concept shows up
    // exactly once. The term-as-category lets the card tile pick a soft category
    // color (search results are otherwise category-less / 'General').
    const cacheKey = `best_symbols_v3_${locale}`;
    const cached = await getFromCache<SymbolItem[]>(cacheKey);
    if (cached) return cached;

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

    await saveToCache(cacheKey, finalResults, true);
    return finalResults;
  },

  async getCategories(locale: string = 'pt'): Promise<string[]> {
    try {
      const cacheKey = `categories_${locale}`;
      const cached = await getFromCache<string[]>(cacheKey);
      if (cached) return cached;

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

      await saveToCache(cacheKey, unique, true);
      return unique;
    } catch (error) {
      console.error('Error fetching ARASAAC categories:', error);
      return FALLBACK_CATEGORIES;
    }
  },

  async getSymbolsByCategory(category: string, locale: string = 'pt'): Promise<SymbolItem[]> {
    try {
      const cacheKey = `category_${category}_${locale}`;
      const cached = await getFromCache<SymbolItem[]>(cacheKey);
      if (cached) return cached;

      const catUrl = `${API_BASE_URL}/pictograms/${locale}/category/${category}`;
      const catData = await fetchWithCache(catUrl);
      
      if (catData && Array.isArray(catData) && catData.length > 0) {
        const results = catData.map((item: any) => ({
          id: item._id.toString(),
          label: item.keywords.find((k: any) => k.type === 1)?.keyword || item.keywords[0]?.keyword || 'Símbolo',
          imageUrl: `${STATIC_BASE_URL}/${item._id}/${item._id}_300.png`,
          category: category,
        }));
        await saveToCache(cacheKey, results);
        return results;
      }

      const tagUrl = `${API_BASE_URL}/pictograms/${locale}/tags/${category}`;
      const tagData = await fetchWithCache(tagUrl);
      
      if (tagData && Array.isArray(tagData) && tagData.length > 0) {
        const results = tagData.map((item: any) => ({
          id: item._id.toString(),
          label: item.keywords.find((k: any) => k.type === 1)?.keyword || item.keywords[0]?.keyword || 'Símbolo',
          imageUrl: `${STATIC_BASE_URL}/${item._id}/${item._id}_300.png`,
          category: category,
        }));
        await saveToCache(cacheKey, results);
        return results;
      }

      const searchResults = await this.searchSymbols(category, locale);
      await saveToCache(cacheKey, searchResults);
      return searchResults;
    } catch (error) {
      console.error('Error fetching symbols by group:', error);
      return [];
    }
  }
};
