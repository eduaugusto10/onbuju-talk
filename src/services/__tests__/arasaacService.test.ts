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
    const result = await arasaacService.searchSymbols('comer', 'pt');

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
});
