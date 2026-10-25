import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { STORAGE_KEYS } from '../storageKeys';
import { flushPersistence, withPersistencePaused } from './persistenceService';

const JOURNAL = 'fala_restore_journal_v1';
export const BACKUP_MAX_BYTES = 64 * 1024 * 1024;
const MAX_MEDIA_BYTES = 40 * 1024 * 1024;
const keys = Object.values(STORAGE_KEYS).filter(key => key !== STORAGE_KEYS.adminPasswordHash);
const arrayKeys = new Set<string>([
  STORAGE_KEYS.favorites, STORAGE_KEYS.customSymbols, STORAGE_KEYS.coreVocabulary,
  STORAGE_KEYS.savedPhrases, STORAGE_KEYS.phraseHistory, STORAGE_KEYS.personalSymbols,
  STORAGE_KEYS.customCategories, STORAGE_KEYS.routineSteps, STORAGE_KEYS.visualScenes
]);
const jsonKeys = new Set([...arrayKeys, STORAGE_KEYS.coreSymbolImages, STORAGE_KEYS.routineProgress, STORAGE_KEYS.sectionVisibility]);
type Media = { extension: string; base64: string };
export type Backup = { format: 'fala-backup'; version: 1; createdAt: string; data: Record<string, string | null>; media: Record<string, Media> };
const isObject = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);

function validSymbol(value: unknown): boolean {
  return isObject(value) && ['id', 'label', 'imageUrl', 'category'].every(key => typeof value[key] === 'string');
}

function validateProfileValue(key: string, value: unknown) {
  const invalid = () => { throw new Error('O backup contém um item incompleto ou inválido.'); };
  if (Array.isArray(value)) {
    for (const item of value) {
      if (key === STORAGE_KEYS.coreVocabulary) continue;
      if (!isObject(item) || typeof item.id !== 'string' || !item.id) invalid();
      const entry = item as Record<string, unknown>;
      if ([STORAGE_KEYS.favorites, STORAGE_KEYS.customSymbols, STORAGE_KEYS.personalSymbols, STORAGE_KEYS.routineSteps].includes(key) && typeof entry.label !== 'string') invalid();
      if (key === STORAGE_KEYS.favorites && !validSymbol(entry)) invalid();
      if (key === STORAGE_KEYS.customSymbols && (!Array.isArray(entry.symbols) || !entry.symbols.every(validSymbol) || (entry.phrase !== undefined && typeof entry.phrase !== 'string'))) invalid();
      if ([STORAGE_KEYS.savedPhrases, STORAGE_KEYS.phraseHistory].includes(key) && typeof entry.text !== 'string') invalid();
      if ([STORAGE_KEYS.customCategories, STORAGE_KEYS.visualScenes].includes(key) && typeof entry.name !== 'string') invalid();
      if (key === STORAGE_KEYS.personalSymbols && (typeof entry.imageUri !== 'string' || (entry.categoryId !== null && typeof entry.categoryId !== 'string'))) invalid();
      if (key === STORAGE_KEYS.routineSteps && entry.activeDays !== undefined && (!Array.isArray(entry.activeDays) || !entry.activeDays.every(day => ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'].includes(day)))) invalid();
      for (const field of ['audioUri', 'imageUri']) if (entry[field] != null && typeof entry[field] !== 'string') invalid();
      if (key === STORAGE_KEYS.visualScenes) {
        if (typeof entry.photoUri !== 'string' || !Array.isArray(entry.hotspots) || entry.hotspots.length > 12) invalid();
        for (const hotspot of entry.hotspots as unknown[]) {
          if (!isObject(hotspot) || typeof hotspot.id !== 'string' || typeof hotspot.label !== 'string' ||
              !['x', 'y', 'radius'].every(field => typeof hotspot[field] === 'number' && Number.isFinite(hotspot[field]) && Number(hotspot[field]) >= 0 && Number(hotspot[field]) <= 1) ||
              (hotspot.audioUri != null && typeof hotspot.audioUri !== 'string')) invalid();
        }
      }
    }
  } else if (isObject(value)) {
    if (key === STORAGE_KEYS.routineProgress && (typeof value.date !== 'string' || !Array.isArray(value.completedStepIds) || !value.completedStepIds.every(id => typeof id === 'string'))) invalid();
    if (key === STORAGE_KEYS.coreSymbolImages && !Object.values(value).every(entry => isObject(entry) && typeof entry.uri === 'string')) invalid();
    if (key === STORAGE_KEYS.sectionVisibility && !Object.values(value).every(entry => typeof entry === 'boolean')) invalid();
  }
}

async function mapStrings(value: unknown, map: (text: string) => Promise<string>): Promise<unknown> {
  if (typeof value === 'string') return map(value);
  if (Array.isArray(value)) {
    const result: unknown[] = [];
    for (const item of value) result.push(await mapStrings(item, map));
    return result;
  }
  if (isObject(value)) {
    const entries: [string, unknown][] = [];
    for (const [key, item] of Object.entries(value)) entries.push([key, await mapStrings(item, map)]);
    return Object.fromEntries(entries);
  }
  return value;
}

export function validateBackup(text: string): Backup {
  if (text.length > BACKUP_MAX_BYTES) throw new Error('O backup excede o limite de 64 MB.');
  const backup: unknown = JSON.parse(text);
  if (!isObject(backup) || backup.format !== 'fala-backup' || backup.version !== 1 ||
      typeof backup.createdAt !== 'string' || !isObject(backup.data) || !isObject(backup.media)) {
    throw new Error('Arquivo de backup inválido ou versão não suportada.');
  }
  if (Object.keys(backup.data).length !== keys.length || keys.some(key => !(key in (backup.data as object)))) {
    throw new Error('O backup está incompleto.');
  }
  for (const [key, raw] of Object.entries(backup.data)) {
    if (!keys.includes(key) || (raw !== null && typeof raw !== 'string')) throw new Error('Dados inválidos no backup.');
    if (raw === null) continue;
    if (jsonKeys.has(key)) {
      const parsed: unknown = JSON.parse(raw);
      if (arrayKeys.has(key) ? !Array.isArray(parsed) : !isObject(parsed)) throw new Error('Dados inválidos no backup.');
      if (Array.isArray(parsed) && (parsed.length > 1000 || parsed.some(item => key === STORAGE_KEYS.coreVocabulary ? typeof item !== 'string' : !isObject(item)))) throw new Error('Lista inválida no backup.');
      validateProfileValue(key, parsed);
    }
    if ((key === STORAGE_KEYS.rate || key === STORAGE_KEYS.pitch) && (!Number.isFinite(Number(raw)) || Number(raw) <= 0 || Number(raw) > 3)) throw new Error('Ajustes de voz inválidos.');
  }
  let mediaBytes = 0;
  for (const [id, item] of Object.entries(backup.media)) {
    if (!/^media-\d+$/.test(id) || !isObject(item) || typeof item.extension !== 'string' ||
        !/^(png|jpg|jpeg|webp|heic|m4a|mp3|wav|aac|caf|3gp)$/.test(item.extension) ||
        typeof item.base64 !== 'string' || !item.base64.length || item.base64.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(item.base64)) {
      throw new Error('Mídia inválida no backup.');
    }
    mediaBytes += item.base64.length * 0.75;
  }
  if (mediaBytes > MAX_MEDIA_BYTES) throw new Error('As fotos e os áudios excedem o limite de 40 MB.');
  return backup as Backup;
}

export async function createBackupFile(): Promise<string> {
  await flushPersistence();
  const data = Object.fromEntries(await AsyncStorage.multiGet(keys));
  const media: Record<string, Media> = {};
  const paths = new Map<string, string>();
  let total = 0;
  for (const key of keys) {
    if (!jsonKeys.has(key) || data[key] === null) continue;
    const parsed = JSON.parse(data[key]!);
    const mapped = await mapStrings(parsed, async uri => {
      if (!/^(file|content):\/\//.test(uri)) return uri;
      if (!FileSystem.documentDirectory || !uri.startsWith(FileSystem.documentDirectory)) throw new Error('Uma imagem ou áudio ainda não foi salvo no app.');
      const previous = paths.get(uri);
      if (previous) return previous;
      const info = await FileSystem.getInfoAsync(uri);
      if (!info.exists || info.isDirectory) throw new Error('Uma foto ou gravação não foi encontrada. O backup não foi criado.');
      total += info.size;
      if (total > MAX_MEDIA_BYTES) throw new Error('As fotos e os áudios excedem o limite de 40 MB por backup.');
      const extension = uri.split('.').pop()?.toLowerCase() || '';
      if (!/^(png|jpg|jpeg|webp|heic|m4a|mp3|wav|aac|caf|3gp)$/.test(extension)) throw new Error('Formato de mídia não suportado.');
      const id = `media-${paths.size}`;
      media[id] = { extension, base64: await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 }) };
      const reference = `fala-media:${id}`;
      paths.set(uri, reference);
      return reference;
    });
    data[key] = JSON.stringify(mapped);
  }
  const backup: Backup = { format: 'fala-backup', version: 1, createdAt: new Date().toISOString(), data, media };
  const text = JSON.stringify(backup);
  validateBackup(text);
  if (!FileSystem.cacheDirectory) throw new Error('Armazenamento indisponível.');
  const uri = `${FileSystem.cacheDirectory}fala-backup-${Date.now()}.json`;
  await FileSystem.writeAsStringAsync(uri, text);
  return uri;
}

// A journal restores the previous profile if the app stops during an import.
export async function recoverInterruptedRestore() {
  const raw = await AsyncStorage.getItem(JOURNAL);
  if (!raw) return;
  const previous = JSON.parse(raw) as [string, string | null][];
  await AsyncStorage.multiSet(previous.filter((pair): pair is [string, string] => pair[1] !== null));
  await AsyncStorage.multiRemove(previous.filter(([, value]) => value === null).map(([key]) => key));
  await AsyncStorage.removeItem(JOURNAL);
}

async function restoreBackupData(backup: Backup) {
  validateBackup(JSON.stringify(backup));
  await flushPersistence();
  if (!FileSystem.documentDirectory) throw new Error('Armazenamento indisponível.');
  const restoredPaths: string[] = [];
  const mediaPaths = new Map<string, string>();
  try {
    for (const [id, item] of Object.entries(backup.media)) {
      const directory = /^(m4a|mp3|wav|aac|caf|3gp)$/.test(item.extension) ? 'personal-audio' : 'personal-symbols';
      const root = `${FileSystem.documentDirectory}${directory}/`;
      await FileSystem.makeDirectoryAsync(root, { intermediates: true });
      const uri = `${root}restore-${Date.now()}-${id}.${item.extension}`;
      restoredPaths.push(uri);
      await FileSystem.writeAsStringAsync(uri, item.base64, { encoding: FileSystem.EncodingType.Base64 });
      mediaPaths.set(`fala-media:${id}`, uri);
    }
    const entries: [string, string | null][] = [];
    for (const key of keys) {
      let raw = backup.data[key];
      if (raw !== null && jsonKeys.has(key)) {
        raw = JSON.stringify(await mapStrings(JSON.parse(raw), async value => {
          if (value.startsWith('fala-media:')) {
            const uri = mediaPaths.get(value);
            if (!uri) throw new Error('Uma mídia referenciada está ausente no backup.');
            return uri;
          }
          if (/^(file|content):\/\//.test(value)) throw new Error('O backup contém arquivos externos não portáveis.');
          return value;
        }));
      }
      entries.push([key, raw]);
    }
    const previous = await AsyncStorage.multiGet(keys);
    await AsyncStorage.setItem(JOURNAL, JSON.stringify(previous));
    try {
      await AsyncStorage.multiSet(entries.filter((pair): pair is [string, string] => pair[1] !== null));
      await AsyncStorage.multiRemove(entries.filter(([, value]) => value === null).map(([key]) => key));
      await AsyncStorage.removeItem(JOURNAL);
    } catch (error) {
      await recoverInterruptedRestore();
      throw error;
    }
  } catch (error) {
    // Do not remove files if rollback failed and some restored data still refers to them.
    if (!(await AsyncStorage.getItem(JOURNAL))) {
      await Promise.all(restoredPaths.map(uri => FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {})));
    }
    throw error;
  }
}

export function restoreBackup(backup: Backup) {
  return withPersistencePaused(() => restoreBackupData(backup));
}
