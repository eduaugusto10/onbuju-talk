import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';

const IMAGE_CACHE_DIR = `${FileSystem.documentDirectory}arasaac-images/`;
const CACHE_INDEX_KEY = 'image_cache_index_v1';
const MAX_CACHE_BYTES = 300 * 1024 * 1024;
const TARGET_CACHE_BYTES = 240 * 1024 * 1024;
const uriMap = new Map<string, string>();
let ensureDirPromise: Promise<void> | null = null;
let indexLoaded = false;

type ImageCacheMetrics = {
  cacheHit: number;
  cacheMiss: number;
  cacheDownload: number;
  cacheError: number;
  evicted: number;
};

const metrics: ImageCacheMetrics = {
  cacheHit: 0,
  cacheMiss: 0,
  cacheDownload: 0,
  cacheError: 0,
  evicted: 0
};

type CacheEntry = {
  localPath: string;
  lastAccessAt: number;
  sizeBytes: number;
};

const cacheIndex = new Map<string, CacheEntry>();

function hashValue(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return Math.abs(hash >>> 0).toString(16);
}

function getExtension(uri: string) {
  const clean = uri.split('?')[0];
  const match = clean.match(/\.(png|jpg|jpeg|webp)$/i);
  if (!match) return '.png';
  return `.${match[1].toLowerCase()}`;
}

async function ensureImageCacheDir() {
  if (!ensureDirPromise) {
    ensureDirPromise = FileSystem.makeDirectoryAsync(IMAGE_CACHE_DIR, { intermediates: true }).then(() => undefined);
  }
  await ensureDirPromise;
}

async function loadIndexOnce() {
  if (indexLoaded) return;
  indexLoaded = true;
  try {
    const raw = await AsyncStorage.getItem(CACHE_INDEX_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Record<string, CacheEntry>;
    Object.entries(parsed).forEach(([remoteUri, entry]) => {
      if (entry?.localPath) {
        cacheIndex.set(remoteUri, entry);
      }
    });
  } catch {
    // ignore corrupted index and rebuild over time
  }
}

async function persistIndex() {
  try {
    const serializable: Record<string, CacheEntry> = {};
    cacheIndex.forEach((entry, key) => {
      serializable[key] = entry;
    });
    await AsyncStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(serializable));
  } catch {
    // best effort only
  }
}

function getTargetPath(remoteUri: string) {
  return `${IMAGE_CACHE_DIR}${hashValue(remoteUri)}${getExtension(remoteUri)}`;
}

async function cleanupCacheIfNeeded() {
  if (cacheIndex.size === 0) return;
  let totalSize = 0;
  cacheIndex.forEach(entry => {
    totalSize += entry.sizeBytes || 0;
  });
  if (totalSize <= MAX_CACHE_BYTES) return;

  const entries = Array.from(cacheIndex.entries()).sort((a, b) => a[1].lastAccessAt - b[1].lastAccessAt);
  for (const [remoteUri, entry] of entries) {
    if (totalSize <= TARGET_CACHE_BYTES) break;
    try {
      await FileSystem.deleteAsync(entry.localPath, { idempotent: true });
    } catch {
      // ignore
    }
    totalSize -= entry.sizeBytes || 0;
    cacheIndex.delete(remoteUri);
    uriMap.delete(remoteUri);
    metrics.evicted += 1;
  }

  await persistIndex();
}

export async function getCachedImageUri(remoteUri: string) {
  if (!remoteUri) return remoteUri;
  if (!/^https?:\/\//i.test(remoteUri)) return remoteUri;
  const fromMap = uriMap.get(remoteUri);
  if (fromMap) {
    metrics.cacheHit += 1;
    return fromMap;
  }

  try {
    await ensureImageCacheDir();
    await loadIndexOnce();

    const now = Date.now();
    const indexedEntry = cacheIndex.get(remoteUri);
    if (indexedEntry) {
      const info = await FileSystem.getInfoAsync(indexedEntry.localPath);
      if (info.exists) {
        indexedEntry.lastAccessAt = now;
        cacheIndex.set(remoteUri, indexedEntry);
        uriMap.set(remoteUri, indexedEntry.localPath);
        metrics.cacheHit += 1;
        void persistIndex();
        return indexedEntry.localPath;
      }
      cacheIndex.delete(remoteUri);
    }

    const localPath = getTargetPath(remoteUri);
    const info = await FileSystem.getInfoAsync(localPath);
    if (info.exists) {
      const sizeBytes = typeof info.size === 'number' ? info.size : 0;
      cacheIndex.set(remoteUri, { localPath, lastAccessAt: now, sizeBytes });
      uriMap.set(remoteUri, localPath);
      metrics.cacheHit += 1;
      void persistIndex();
      return localPath;
    }

    metrics.cacheMiss += 1;
    const downloaded = await FileSystem.downloadAsync(remoteUri, localPath);
    if (downloaded.status >= 200 && downloaded.status < 300) {
      const downloadedInfo = await FileSystem.getInfoAsync(downloaded.uri);
      const sizeBytes = downloadedInfo.exists && typeof downloadedInfo.size === 'number' ? downloadedInfo.size : 0;
      cacheIndex.set(remoteUri, { localPath: downloaded.uri, lastAccessAt: now, sizeBytes });
      uriMap.set(remoteUri, downloaded.uri);
      metrics.cacheDownload += 1;
      void persistIndex();
      void cleanupCacheIfNeeded();
      return downloaded.uri;
    }
    return remoteUri;
  } catch {
    metrics.cacheError += 1;
    return remoteUri;
  }
}

export async function warmImageCache(remoteUris: string[]) {
  const uniqueUris = Array.from(new Set(remoteUris.filter(Boolean))).slice(0, 60);
  const concurrency = 6;
  for (let i = 0; i < uniqueUris.length; i += concurrency) {
    const batch = uniqueUris.slice(i, i + concurrency);
    await Promise.all(batch.map(uri => getCachedImageUri(uri)));
  }
}

export function getImageCacheMetrics() {
  return { ...metrics };
}
