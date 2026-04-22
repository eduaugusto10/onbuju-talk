import * as FileSystem from 'expo-file-system/legacy';

const PERSONAL_AUDIO_DIR = `${FileSystem.documentDirectory}personal-audio/`;
let ensureDirPromise: Promise<void> | null = null;

async function ensureDirectory() {
  if (!ensureDirPromise) {
    ensureDirPromise = FileSystem.makeDirectoryAsync(PERSONAL_AUDIO_DIR, { intermediates: true }).then(() => undefined);
  }
  await ensureDirPromise;
}

function getExtension(uri: string) {
  const clean = uri.split('?')[0];
  const match = clean.match(/\.(m4a|mp3|wav|aac|caf|3gp)$/i);
  if (!match) return '.m4a';
  return `.${match[1].toLowerCase()}`;
}

export async function savePersonalAudioFile(sourceUri: string): Promise<string> {
  if (!sourceUri) throw new Error('Source URI vazia.');
  await ensureDirectory();
  const ext = getExtension(sourceUri);
  const fileName = `audio-${Date.now()}-${Math.floor(Math.random() * 1e6).toString(36)}${ext}`;
  const destUri = `${PERSONAL_AUDIO_DIR}${fileName}`;
  try {
    await FileSystem.copyAsync({ from: sourceUri, to: destUri });
  } catch {
    await FileSystem.moveAsync({ from: sourceUri, to: destUri });
  }
  return destUri;
}

export async function deletePersonalAudioFile(uri: string): Promise<void> {
  if (!uri) return;
  if (!uri.startsWith(PERSONAL_AUDIO_DIR)) return;
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch {
    /* silencioso */
  }
}

export const _personalAudioInternals = { PERSONAL_AUDIO_DIR };
