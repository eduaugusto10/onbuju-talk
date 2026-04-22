import * as FileSystem from 'expo-file-system/legacy';

const PERSONAL_SYMBOLS_DIR = `${FileSystem.documentDirectory}personal-symbols/`;
let ensureDirPromise: Promise<void> | null = null;

async function ensureDirectory() {
  if (!ensureDirPromise) {
    ensureDirPromise = FileSystem.makeDirectoryAsync(PERSONAL_SYMBOLS_DIR, { intermediates: true }).then(() => undefined);
  }
  await ensureDirPromise;
}

function getExtension(uri: string) {
  const clean = uri.split('?')[0];
  const match = clean.match(/\.(png|jpg|jpeg|webp|heic)$/i);
  if (!match) return '.jpg';
  return `.${match[1].toLowerCase()}`;
}

export async function savePersonalSymbolImage(sourceUri: string): Promise<string> {
  if (!sourceUri) throw new Error('Source URI vazia.');
  await ensureDirectory();
  const ext = getExtension(sourceUri);
  const fileName = `symbol-${Date.now()}-${Math.floor(Math.random() * 1e6).toString(36)}${ext}`;
  const destUri = `${PERSONAL_SYMBOLS_DIR}${fileName}`;
  await FileSystem.copyAsync({ from: sourceUri, to: destUri });
  return destUri;
}

export async function deletePersonalSymbolImage(uri: string): Promise<void> {
  if (!uri) return;
  if (!uri.startsWith(PERSONAL_SYMBOLS_DIR)) return;
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch {
    /* silencioso; nao bloquear UI por falha de delete */
  }
}

export const _personalSymbolsInternals = { PERSONAL_SYMBOLS_DIR, getExtension };
