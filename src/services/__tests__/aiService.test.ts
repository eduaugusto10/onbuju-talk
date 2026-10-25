import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateNormalizedPhrase, saveAiApiKey } from '../aiService';
import * as SecureStore from 'expo-secure-store';

describe('aiService', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    jest.mocked(SecureStore.getItemAsync).mockResolvedValue(null);
    await AsyncStorage.clear();
    delete process.env.EXPO_PUBLIC_GOOGLE_AI_API_KEY;
    delete process.env.EXPO_PUBLIC_GOOGLE_API_KEY;
  });

  it('salva chave de IA no armazenamento seguro e remove a cópia antiga', async () => {
    await saveAiApiKey('  minha-chave  ');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('fala_ai_api_key', 'minha-chave');
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('ai_settings_v1');
  });

  it('retorna fallback degradado quando chave nao existe', async () => {
    const result = await generateNormalizedPhrase(['eu', 'quero', 'agua']);
    expect(result.degraded).toBe(true);
    expect(result.text).toBe('eu quero agua');
    expect(result.message).toContain('IA não configurada');
  });

  it('aplica retry e retorna sucesso quando tentativa posterior funciona', async () => {
    jest.mocked(SecureStore.getItemAsync).mockResolvedValue('test-key');
    const fetchMock = jest
      .fn()
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: 'Eu quero agua' }] } }]
        })
      });
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await generateNormalizedPhrase(['eu', 'quero', 'agua']);

    expect(result.degraded).toBe(false);
    expect(result.text).toBe('Eu quero agua');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('não repete erro de chave inválida', async () => {
    jest.mocked(SecureStore.getItemAsync).mockResolvedValue('test-key');
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 403, statusText: 'Forbidden' });
    const result = await generateNormalizedPhrase(['não', 'quero']);
    expect(result).toMatchObject({ text: 'não quero', degraded: true });
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('migra a chave legada somente depois de salvá-la com segurança', async () => {
    await AsyncStorage.setItem('ai_settings_v1', JSON.stringify({ apiKey: 'legacy-key' }));
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 403 });
    await generateNormalizedPhrase(['teste migração']);
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('fala_ai_api_key', 'legacy-key');
    expect(await AsyncStorage.getItem('ai_settings_v1')).toBeNull();
  });
});
