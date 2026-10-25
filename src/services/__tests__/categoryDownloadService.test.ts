import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FS from 'expo-file-system/legacy';
import { downloadCategory, getOfflineCategory, getOfflineImageUri, listOfflineCategories, removeOfflineCategory } from '../categoryDownloadService';

const mockFiles = new Map<string, number>();
let mockFailedUrl = '';
jest.mock('../offlineSymbols', () => ({ bundledImageUri: () => null }));
jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///doc/',
  makeDirectoryAsync: jest.fn(async () => {}),
  getInfoAsync: jest.fn(async (path: string) => ({ exists: mockFiles.has(path), size: mockFiles.get(path) || 0 })),
  moveAsync: jest.fn(async ({ from, to }) => { mockFiles.set(to, mockFiles.get(from)!); mockFiles.delete(from); }),
  deleteAsync: jest.fn(async (path: string) => { for (const name of mockFiles.keys()) if (name.startsWith(path)) mockFiles.delete(name); }),
  createDownloadResumable: jest.fn((url: string, path: string) => ({
    pauseAsync: jest.fn(async () => {}),
    downloadAsync: jest.fn(async () => {
      if (url === mockFailedUrl) return { status: 503 };
      mockFiles.set(path, 100);
      return { status: 200, uri: path };
    })
  }))
}));
const symbols = [1, 2, 3].map(id => ({ id: String(id), label: `Símbolo ${id}`, category: 'Escola', imageUrl: `https://example.com/${id}.png` }));
beforeEach(async () => { await AsyncStorage.clear(); mockFiles.clear(); mockFailedUrl = ''; jest.clearAllMocks(); });

it('salva catálogo e imagens locais, disponíveis sem consultar a rede novamente', async () => {
  const pack = await downloadCategory('Escola', async () => symbols, jest.fn());
  expect(pack).toMatchObject({ ready: 3, bytes: 300 });
  const restored = await getOfflineCategory('Escola');
  expect(restored).toEqual(symbols);
  expect(await getOfflineImageUri(symbols[0].imageUrl)).toMatch(/^file:\/\/\/doc\/offline-categories\//);
  const load = jest.fn();
  await downloadCategory('Escola', load, jest.fn());
  expect(load).not.toHaveBeenCalled();
  expect(FS.createDownloadResumable).toHaveBeenCalledTimes(3);
});

it('mantém download parcial e retoma apenas imagens que faltam', async () => {
  mockFailedUrl = symbols[1].imageUrl;
  await expect(downloadCategory('Escola', async () => symbols, jest.fn())).rejects.toThrow('1 imagens');
  expect((await listOfflineCategories())[0].ready).toBe(2);
  expect([...mockFiles.keys()].some(path => path.endsWith('.part'))).toBe(false);
  mockFailedUrl = '';
  await downloadCategory('Escola', jest.fn(), jest.fn());
  expect(FS.createDownloadResumable).toHaveBeenCalledTimes(4);
  expect((await listOfflineCategories())[0].ready).toBe(3);
});

it('pausa entre imagens e permite retomar', async () => {
  const controller = new AbortController();
  await expect(downloadCategory('Escola', async () => symbols, () => controller.abort(), controller.signal)).rejects.toThrow('pausado');
  expect((await listOfflineCategories())[0].ready).toBe(1);
  await downloadCategory('Escola', jest.fn(), jest.fn());
  expect((await listOfflineCategories())[0].ready).toBe(3);
});

it('remove somente a categoria selecionada', async () => {
  await downloadCategory('Escola', async () => symbols, jest.fn());
  await downloadCategory('Pessoas', async () => symbols, jest.fn());
  await removeOfflineCategory('Escola');
  expect(await getOfflineCategory('Escola')).toBeNull();
  expect((await listOfflineCategories()).map(pack => pack.category)).toEqual(['Pessoas']);
  expect(await getOfflineImageUri(symbols[0].imageUrl)).toContain('category-Pessoas');
});

it('não marca uma categoria vazia como disponível offline', async () => {
  await expect(downloadCategory('Escola', async () => [], jest.fn())).rejects.toThrow('Nenhum símbolo');
  expect(await listOfflineCategories()).toEqual([]);
});
