import AsyncStorage from '@react-native-async-storage/async-storage';

describe('arasaacService', () => {
  beforeEach(async () => {
    jest.resetModules();
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  it('mapeia retorno de busca para SymbolItem', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          _id: 123,
          keywords: [{ type: 1, keyword: 'comer' }]
        }
      ]
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const { arasaacService } = require('../arasaacService');
    const result = await arasaacService.searchSymbols('almoço', 'pt');

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: '123',
      label: 'comer',
      category: 'General'
    });
  });

  it('retorna fallback de categorias quando rede falha', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network error')) as unknown as typeof fetch;

    const { arasaacService } = require('../arasaacService');
    const result = await arasaacService.getCategories('pt');

    expect(result.length).toBeGreaterThanOrEqual(5);
    expect(result).toContain('Saúde');
  });

  it('oferece vocabulário inicial com imagens embarcadas sem fazer requisições', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('offline'));
    const { arasaacService } = require('../arasaacService');
    const result = await arasaacService.getBestSymbols('pt');
    expect(result).toHaveLength(16);
    expect(result.map((item: { label: string }) => item.label)).toContain('banheiro');
    expect(new Set(result.map((item: { id: string }) => item.id)).size).toBe(16);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('reutiliza a busca persistida após reiniciar o módulo sem rede', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => [{ _id: 123, keywords: [{ type: 1, keyword: 'bicicleta' }] }] });
    const first = require('../arasaacService').arasaacService;
    expect(await first.searchSymbols('bicicleta')).toHaveLength(1);
    jest.resetModules();
    global.fetch = jest.fn().mockRejectedValue(new Error('offline'));
    const second = require('../arasaacService').arasaacService;
    expect(await second.searchSymbols('bicicleta')).toHaveLength(1);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('não guarda falha de rede como resultado vazio permanente', async () => {
    global.fetch = jest.fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({ ok: true, json: async () => [{ _id: 123, keywords: [{ type: 1, keyword: 'bicicleta' }] }] });
    const { arasaacService } = require('../arasaacService');
    expect(await arasaacService.searchSymbols('bicicleta')).toEqual([]);
    expect(await arasaacService.searchSymbols('bicicleta')).toHaveLength(1);
  });
});
