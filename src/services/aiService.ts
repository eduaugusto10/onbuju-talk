import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';
const CACHE_PREFIX = 'ai_cache_';
const AI_SETTINGS_KEY = 'ai_settings_v1';
const REQUEST_TIMEOUT_MS = 8000;
const MAX_RETRIES = 2;

type AiSettings = {
  apiKey?: string;
};

export type PhraseResult = {
  text: string;
  degraded: boolean;
  message?: string;
};

async function getCachedResponse(prompt: string): Promise<string | null> {
  try {
    const cached = await AsyncStorage.getItem(CACHE_PREFIX + prompt);
    return cached;
  } catch {
    return null;
  }
}

async function saveCachedResponse(prompt: string, response: string) {
  try {
    await AsyncStorage.setItem(CACHE_PREFIX + prompt, response);
  } catch (e) {
    console.warn('Failed to cache AI response:', e);
  }
}

async function getStoredSettings(): Promise<AiSettings> {
  try {
    const raw = await AsyncStorage.getItem(AI_SETTINGS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as AiSettings;
  } catch {
    return {};
  }
}

async function getAiApiKey(): Promise<string> {
  const envKey = (process.env.EXPO_PUBLIC_GOOGLE_AI_API_KEY || process.env.EXPO_PUBLIC_GOOGLE_API_KEY || '').trim();
  if (envKey) return envKey;
  const settings = await getStoredSettings();
  return (settings.apiKey || '').trim();
}

export async function saveAiApiKey(apiKey: string): Promise<void> {
  const clean = apiKey.trim();
  const current = await getStoredSettings();
  const next: AiSettings = { ...current, apiKey: clean };
  await AsyncStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(next));
}

function normalizeApiError(status: number, statusText: string) {
  if (status === 429) return 'Limite temporário de requisições. Tente novamente em instantes.';
  if (status === 403) return 'Chave da IA inválida ou sem permissão.';
  if (status === 402) return 'Uso da IA excedido no provedor.';
  if (status >= 500) return 'Serviço de IA indisponível no momento.';
  return `Erro da IA (${status} - ${statusText}).`;
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function requestWithRetry(prompt: string, apiKey: string) {
  let lastMessage = 'Falha de comunicação com a IA.';
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        lastMessage = normalizeApiError(response.status, response.statusText);
        if ((response.status === 429 || response.status >= 500) && attempt < MAX_RETRIES) {
          await delay(250 * (attempt + 1));
          continue;
        }
        throw new Error(lastMessage);
      }

      const data = await response.json();
      const normalizedPhrase = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      if (!normalizedPhrase) {
        throw new Error('Resposta vazia da IA.');
      }
      return normalizedPhrase;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro inesperado na IA.';
      const isAbort = message.toLowerCase().includes('aborted');
      if (isAbort) {
        lastMessage = 'Tempo de resposta excedido na IA.';
      } else {
        lastMessage = message;
      }
      if (attempt < MAX_RETRIES) {
        await delay(250 * (attempt + 1));
        continue;
      }
      throw new Error(lastMessage);
    } finally {
      clearTimeout(timeout);
    }
  }
  throw new Error(lastMessage);
}

export async function generateNormalizedPhrase(symbolLabels: string[]): Promise<PhraseResult> {
  if (symbolLabels.length === 0) {
    return { text: '', degraded: false };
  }

  const prompt = `Combine os seguintes símbolos em uma frase coerente em português brasileiro. Os símbolos são: ${symbolLabels.join(', ')}. Retorne apenas a frase normalizada, sem explicações.`;

  // Check cache first
  const cached = await getCachedResponse(prompt);
  if (cached) {
    return { text: cached, degraded: false };
  }

  try {
    const apiKey = await getAiApiKey();
    if (!apiKey) {
      const fallback = symbolLabels.join(' ');
      return {
        text: fallback,
        degraded: true,
        message: 'IA não configurada. Defina a chave em EXPO_PUBLIC_GOOGLE_AI_API_KEY ou no app.'
      };
    }

    const normalizedPhrase = await requestWithRetry(prompt, apiKey);

    // Cache the response
    await saveCachedResponse(prompt, normalizedPhrase);

    return { text: normalizedPhrase, degraded: false };
  } catch (error) {
    if (__DEV__) {
      console.warn('AI fallback:', error);
    }
    return {
      text: symbolLabels.join(' '),
      degraded: true,
      message: error instanceof Error ? error.message : 'IA indisponível no momento.'
    };
  }
}
