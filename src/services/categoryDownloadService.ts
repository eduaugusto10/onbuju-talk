import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { SymbolItem } from '../types';
import { bundledImageUri } from './offlineSymbols';

const KEY = 'offline_categories_v1';
const ROOT = `${FileSystem.documentDirectory}offline-categories/`;
export type OfflineCategory = { category: string; symbols: SymbolItem[]; ready: number; bytes: number };
let running = false;

export async function listOfflineCategories(): Promise<OfflineCategory[]> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}

function directory(category: string) { return `${ROOT}category-${encodeURIComponent(category)}/`; }
function imagePath(category: string, index: number) { return `${directory(category)}${index}.png`; }

export async function getOfflineCategory(category: string): Promise<SymbolItem[] | null> {
  const pack = (await listOfflineCategories()).find(item => item.category === category);
  return pack?.symbols ?? null;
}

export async function getOfflineImageUri(remoteUri: string): Promise<string | null> {
  for (const pack of await listOfflineCategories()) {
    const index = pack.symbols.findIndex(symbol => symbol.imageUrl === remoteUri);
    if (index < 0) continue;
    const path = imagePath(pack.category, index);
    const info = await FileSystem.getInfoAsync(path);
    if (info.exists && info.size > 0) return path;
  }
  return null;
}

// Explicit downloads live outside the disposable image cache.
export async function downloadCategory(
  category: string,
  loadSymbols: () => Promise<SymbolItem[]>,
  onProgress: (ready: number, total: number) => void,
  signal?: AbortSignal
): Promise<OfflineCategory> {
  if (running) throw new Error('Aguarde o download atual.');
  running = true;
  try {
    const packs = await listOfflineCategories();
    let pack = packs.find(item => item.category === category);
    if (!pack) {
      const symbols = await loadSymbols();
      if (!symbols.length) throw new Error('Nenhum símbolo disponível. Confira sua conexão e tente novamente.');
      pack = { category, symbols, ready: 0, bytes: 0 };
      packs.push(pack);
    }
    await FileSystem.makeDirectoryAsync(directory(category), { intermediates: true });
    // Save the full catalog before downloading so retries use stable file names.
    await AsyncStorage.setItem(KEY, JSON.stringify(packs));
    pack.ready = 0;
    pack.bytes = 0;
    let failures = 0;
    try {
      for (let index = 0; index < pack.symbols.length; index += 1) {
        if (signal?.aborted) throw new Error('Download pausado. Toque em continuar para retomar.');
        const symbol = pack.symbols[index];
        const path = imagePath(category, index);
        if (bundledImageUri(symbol.imageUrl)) {
          pack.ready += 1;
        } else {
          try {
            let info = await FileSystem.getInfoAsync(path);
            if (!info.exists || info.size === 0) {
              const temporary = `${path}.part`;
              try {
                const task = FileSystem.createDownloadResumable(symbol.imageUrl, temporary);
                const cancel = () => { void task.pauseAsync().catch(() => {}); };
                signal?.addEventListener('abort', cancel);
                const timeout = setTimeout(cancel, 30000);
                let result;
                try { result = await task.downloadAsync(); }
                finally { clearTimeout(timeout); signal?.removeEventListener('abort', cancel); }
                if (signal?.aborted) throw new Error('Pausado');
                const downloaded = await FileSystem.getInfoAsync(temporary);
                if (!result || result.status !== 200 || !downloaded.exists || downloaded.size === 0) throw new Error('Download incompleto');
                await FileSystem.moveAsync({ from: temporary, to: path });
              } finally { await FileSystem.deleteAsync(temporary, { idempotent: true }).catch(() => {}); }
              info = await FileSystem.getInfoAsync(path);
            }
            if (info.exists) { pack.bytes += info.size; pack.ready += 1; }
          } catch { failures += 1; }
        }
        onProgress(pack.ready, pack.symbols.length);
      }
    } finally { await AsyncStorage.setItem(KEY, JSON.stringify(packs)); }
    if (signal?.aborted) throw new Error('Download pausado. Toque em continuar para retomar.');
    if (failures) throw new Error(`${failures} imagens não foram baixadas. Confira sua conexão e toque em continuar.`);
    return pack;
  } finally { running = false; }
}

export async function removeOfflineCategory(category: string) {
  if (running) throw new Error('Aguarde ou pause o download atual.');
  const packs = await listOfflineCategories();
  await FileSystem.deleteAsync(directory(category), { idempotent: true });
  await AsyncStorage.setItem(KEY, JSON.stringify(packs.filter(item => item.category !== category)));
}
