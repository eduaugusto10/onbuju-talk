import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateNormalizedPhrase, saveAiApiKey } from '../aiService';

describe('aiService', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
    delete process.env.EXPO_PUBLIC_GOOGLE_AI_API_KEY;
    delete process.env.EXPO_PUBLIC_GOOGLE_API_KEY;
  });

  it('salva chave de IA no storage com trim', async () => {
    await saveAiApiKey('  minha-chave  ');
    const raw = await AsyncStorage.getItem('ai_settings_v1');
    expect(raw).toContain('minha-chave');
  });

  it('retorna fallback degradado quando chave nao existe', async () => {
    const result = await generateNormalizedPhrase(['eu', 'quero', 'agua']);
    expect(result.degraded).toBe(true);
    expect(result.text).toBe('eu quero agua');
    expect(result.message).toContain('IA não configurada');
  });

  it('aplica retry e retorna sucesso quando tentativa posterior funciona', async () => {
    process.env.EXPO_PUBLIC_GOOGLE_AI_API_KEY = 'test-key';
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
});
